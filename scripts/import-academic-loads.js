/**
 * Importa profesores, cursos y cargas académicas a partir de
 * Codex_Info/cargas_normalized.csv.
 *
 * Configuración opcional vía env vars:
 *  - CSV_PATH: ruta al CSV (default Codex_Info/cargas_normalized.csv)
 *  - CAMPUS_FILTER: lista separada por comas con nombres de campus/escuela a importar
 *  - IMPORT_LIMIT: número máximo de filas a procesar (útil para pilotos)
 *  - REGIONAL_CENTER_ID: ID del centro regional para crear campus nuevos
 *  - PROFESSOR_ROLE_ID: ID del rol PROFESOR
 *  - ACADEMIC_YEAR: año del ciclo (default 2025)
 *  - DRY_RUN=true para simular sin escribir en BD
 *
 * Ejecutar (piloto):
 *    DATABASE_URL=... IMPORT_LIMIT=10 CAMPUS_FILTER="Educología,Administración" node scripts/import-academic-loads.js
 */

const fs = require("fs");
const path = require("path");
const {
  PrismaClient,
} = require("../packages/database/prisma/generated/client/index.js");

const CSV_PATH =
  process.env.CSV_PATH || path.resolve("Codex_Info/cargas_normalized.csv");
const CAMPUS_FILTER = process.env.CAMPUS_FILTER
  ? process.env.CAMPUS_FILTER.split(",").map((c) =>
      c ? normalizeText(c).toLowerCase() : ""
    )
  : null;
const IMPORT_LIMIT = process.env.IMPORT_LIMIT
  ? Number(process.env.IMPORT_LIMIT)
  : Infinity;
const REGIONAL_CENTER_ID =
  process.env.REGIONAL_CENTER_ID || "5f488f049bde5140b0545400"; // Sede Regional Brunca
const PROFESSOR_ROLE_ID =
  process.env.PROFESSOR_ROLE_ID || "507f1f77bcf86cd799439011";
const ACADEMIC_YEAR = process.env.ACADEMIC_YEAR
  ? Number(process.env.ACADEMIC_YEAR)
  : 2025;
const DRY_RUN = process.env.DRY_RUN === "true";

const prisma = new PrismaClient();

const DAY_MAP = {
  L: "MONDAY",
  M: "TUESDAY",
  I: "WEDNESDAY",
  J: "THURSDAY",
  V: "FRIDAY",
  S: "SATURDAY",
  D: "SUNDAY",
};

const campusCache = new Map();
const cycleCache = new Map();
const groupCache = new Map();
const courseCache = new Map();
const scheduleCache = new Map();
const userCache = new Map();
let professorRoleMembers = null;

function parseCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No se encontró el archivo CSV en ${CSV_PATH}`);
  }
  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = lines.shift().split(";");
  return lines.map((line) => {
    const cols = line.split(";");
    return Object.fromEntries(
      headers.map((header, idx) => [header, cols[idx] ?? ""])
    );
  });
}

function normalizeText(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function campusKey(name) {
  return normalizeText(name).toLowerCase();
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function parseTimeRange(range) {
  if (!range) return null;
  const match = range.match(/^(\d{3,4})-(\d{3,4})$/);
  if (!match) return null;
  const [_, startRaw, endRaw] = match;
  const normalize = (str) =>
    `${str.padStart(4, "0").slice(0, 2)}:${str.padStart(4, "0").slice(2)}`;
  return { start: normalize(startRaw), end: normalize(endRaw) };
}

function slugify(value, length = 6) {
  const normalized = normalizeText(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized) return `AUTO${Math.floor(Math.random() * 9999)}`;
  return normalized.slice(0, length).padEnd(length, "X");
}

function splitProfessorName(raw) {
  const clean = normalizeText(raw);
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return {
      firstNames: "Profesor",
      lastNames: "Pendiente",
      firstToken: null,
      lastToken: null,
    };
  }
  if (tokens.length === 1) {
    return {
      firstNames: capitalize(tokens[0]),
      lastNames: "",
      firstToken: tokens[0],
      lastToken: null,
    };
  }
  const firstNames = tokens.slice(0, -2).join(" ") || tokens[0];
  const lastNames = tokens.slice(-2).join(" ");
  return {
    firstNames: capitalize(firstNames),
    lastNames: capitalize(lastNames),
    firstToken: tokens[0],
    lastToken: tokens[tokens.length - 1],
  };
}

function capitalize(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildEmail(name, campus, nrc) {
  const base = normalizeText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
  const campusSlug = slugify(campus, 3).toLowerCase();
  return `${base || "profesor"}.${campusSlug}${nrc}@profesores.una.test`;
}

async function ensureCampus(name) {
  const displayName = (name || "").trim() || "Sin nombre";
  const key = campusKey(displayName);
  if (campusCache.has(key)) return campusCache.get(key);

  const existing = await prisma.campus.findFirst({
    where: { name: { equals: displayName, mode: "insensitive" } },
  });
  if (existing) {
    campusCache.set(key, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = {
      id: `campus-${slugify(displayName, 8)}`,
      code: `AUTO-${slugify(displayName)}`,
      name: displayName,
      regionalCenterId: REGIONAL_CENTER_ID,
    };
    campusCache.set(key, fake);
    return fake;
  }

  const created = await prisma.campus.create({
    data: {
      code: `AUTO-${slugify(displayName)}`,
      name: displayName,
      description: `Campus generado automáticamente para ${displayName}`,
      regionalCenterId: REGIONAL_CENTER_ID,
      status: "ACTIVE",
    },
  });
  campusCache.set(key, created);
  return created;
}

async function ensureAcademicCycle(periodValue) {
  const key = `${periodValue}-${ACADEMIC_YEAR}`;
  if (cycleCache.has(key)) return cycleCache.get(key);

  const name =
    periodValue === "2"
      ? "Ciclo II"
      : periodValue === "3"
      ? "Ciclo III"
      : "Ciclo I";

  const existing = await prisma.academicCycle.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      year: ACADEMIC_YEAR,
    },
  });
  if (existing) {
    cycleCache.set(key, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = {
      id: `cycle-${key}`,
      code: `C-${periodValue}-${ACADEMIC_YEAR}`,
      name,
      year: ACADEMIC_YEAR,
    };
    cycleCache.set(key, fake);
    return fake;
  }

  const created = await prisma.academicCycle.create({
    data: {
      code: `C-${periodValue}-${ACADEMIC_YEAR}`,
      name,
      year: ACADEMIC_YEAR,
      status: "ACTIVE",
    },
  });
  cycleCache.set(key, created);
  return created;
}

async function ensureGroup(number) {
  if (!number) throw new Error("Número de grupo vacío");
  const normalized = number.trim();
  if (groupCache.has(normalized)) return groupCache.get(normalized);

  const existing = await prisma.academicLoadGroup.findUnique({
    where: { number: normalized },
  });
  if (existing) {
    groupCache.set(normalized, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = { id: `group-${normalized}`, number: normalized };
    groupCache.set(normalized, fake);
    return fake;
  }

  const created = await prisma.academicLoadGroup.create({
    data: { number: normalized, status: "ACTIVE" },
  });
  groupCache.set(normalized, created);
  return created;
}

async function ensureCourse(row) {
  const code = row["curso_codigo"];
  if (!code) throw new Error("Curso sin código");
  if (courseCache.has(code)) return courseCache.get(code);

  const creditsRaw = toNumber(row["cred_cobr"]) ?? 0;
  const levelRaw = toNumber(row["nivel"]) ?? 0;
  const credits = Math.round(creditsRaw);
  const level = Math.round(levelRaw);
  const contactHours = Math.max(credits * 15, 0);

  const existing = await prisma.course.findUnique({
    where: { code },
  });
  if (existing) {
    courseCache.set(code, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = { id: `course-${code}`, code };
    courseCache.set(code, fake);
    return fake;
  }

  const created = await prisma.course.create({
    data: {
      code,
      name: capitalize(row["curso_nombre"] || code),
      credits,
      level,
      contactHours,
      status: "ACTIVE",
    },
  });
  courseCache.set(code, created);
  return created;
}

async function ensureSchedule(row, campusId) {
  const dayRaw = (row["dias"] || "").trim();
  const hours = parseTimeRange(row["horas"] || "");
  if (!dayRaw || !hours) return null;
  const day = DAY_MAP[dayRaw.toUpperCase()];
  if (!day) return null;
  const key = `${day}-${hours.start}-${hours.end}`;
  if (scheduleCache.has(key)) return scheduleCache.get(key);

  const existing = await prisma.schedule.findFirst({
    where: { name: key },
  });
  if (existing) {
    scheduleCache.set(key, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = { id: `schedule-${key}`, name: key };
    scheduleCache.set(key, fake);
    return fake;
  }

  const created = await prisma.schedule.create({
    data: {
      name: key,
      day,
      startTime: hours.start,
      endTime: hours.end,
    },
  });
  scheduleCache.set(key, created);
  return created;
}

async function ensureProfessor(row) {
  const key = normalizeText(row["profesor"]).toLowerCase();
  if (userCache.has(key)) return userCache.get(key);
  const { firstNames, lastNames, firstToken, lastToken } = splitProfessorName(
    row["profesor"]
  );
  const email = buildEmail(row["profesor"], row["campus"], row["nrc"]);

  const conditions = [];
  if (firstToken) {
    conditions.push({
      fullName: { contains: firstToken, mode: "insensitive" },
    });
  }
  if (lastToken) {
    conditions.push({
      fullLastName: { contains: lastToken, mode: "insensitive" },
    });
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        conditions.length
          ? { AND: conditions }
          : { fullName: { equals: firstNames, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    if (!existing.roleIds?.includes(PROFESSOR_ROLE_ID) && !DRY_RUN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          roleIds: { push: PROFESSOR_ROLE_ID },
          status: "ACTIVE",
        },
      });
      await ensureProfessorRoleLink(existing.id);
    }
    userCache.set(key, existing);
    return existing;
  }

  if (DRY_RUN) {
    const fake = { id: `user-${slugify(row["profesor"], 8)}`, email };
    userCache.set(key, fake);
    return fake;
  }

  const created = await prisma.user.create({
    data: {
      email,
      fullName: firstNames,
      fullLastName: lastNames,
      roleIds: [PROFESSOR_ROLE_ID],
      status: "ACTIVE",
    },
  });
  await ensureProfessorRoleLink(created.id);
  userCache.set(key, created);
  return created;
}

async function ensureProfessorRoleLink(userId) {
  if (DRY_RUN) return;
  if (!professorRoleMembers) {
    const role = await prisma.userRole.findUnique({
      where: { id: PROFESSOR_ROLE_ID },
      select: { userIds: true },
    });
    professorRoleMembers = new Set(role?.userIds || []);
  }
  if (professorRoleMembers.has(userId)) return;
  await prisma.userRole.update({
    where: { id: PROFESSOR_ROLE_ID },
    data: { userIds: { push: userId } },
  });
  professorRoleMembers.add(userId);
}

async function upsertAcademicLoad(row, context) {
  const nrc = row["nrc"];
  if (!nrc) throw new Error("Fila sin NRC");
  const maximumCapacity = toNumber(row["cupo_max"]) ?? 0;
  const enrolledCapacity = toNumber(row["cupo_mat"]) ?? 0;
  const availableSeats =
    toNumber(row["cupo_dispo"]) ?? maximumCapacity - enrolledCapacity;

  const payload = {
    nrc,
    maximumCapacity,
    enrolledCapacity,
    availableSeats,
    date: null,
    status: "ACTIVE",
    academicCycleId: context.cycle.id,
    campusId: context.campus.id,
    courseId: context.course.id,
    groupId: context.group.id,
    professorId: context.professor.id,
  };

  if (context.schedule) {
    payload.scheduleId = context.schedule.id;
  }

  const existing = await prisma.academicLoad.findFirst({ where: { nrc } });
  if (existing) {
    if (DRY_RUN) return { action: "skip-existing", id: existing.id };
    await prisma.academicLoad.update({
      where: { id: existing.id },
      data: payload,
    });
    return { action: "updated", id: existing.id };
  }

  if (DRY_RUN) return { action: "create-preview", id: `nrc-${nrc}` };
  const created = await prisma.academicLoad.create({ data: payload });
  return { action: "created", id: created.id };
}

async function processRow(row) {
  const campusNormalized = campusKey(row["campus"]);
  const campusAllowed =
    !CAMPUS_FILTER || CAMPUS_FILTER.includes(campusNormalized);
  if (!campusAllowed) return { skipped: "campus" };

  const campus = await ensureCampus(row["campus"]);
  const cycle = await ensureAcademicCycle(row["periodo"]);
  const group = await ensureGroup(row["grupo"]);
  const course = await ensureCourse(row);
  const schedule = await ensureSchedule(row, campus.id);
  const professor = await ensureProfessor(row);

  const result = await upsertAcademicLoad(row, {
    campus,
    cycle,
    group,
    course,
    schedule,
    professor,
  });
  return { result };
}

async function main() {
  const rows = parseCsv();
  let processed = 0;
  let created = 0;
  let updated = 0;
  const errors = [];

  for (const row of rows) {
    if (processed >= IMPORT_LIMIT) break;
    try {
      const response = await processRow(row);
      if (response.skipped) continue;
      processed += 1;
      if (response.result?.action === "created") created += 1;
      if (response.result?.action === "updated") updated += 1;
    } catch (error) {
      errors.push({ row: row["nrc"], error: error.message });
      console.error(
        `Error importando NRC ${row["nrc"]} (${row["curso_codigo"]}):`,
        error.message
      );
    }
  }

  console.log(
    `Import completado. Procesados: ${processed}, creados: ${created}, actualizados: ${updated}, errores: ${errors.length}`
  );
  if (errors.length) {
    const file = path.resolve("Codex_Info/import_errors.json");
    fs.writeFileSync(file, JSON.stringify(errors, null, 2));
    console.log(`Detalles de errores en ${file}`);
  }
}

main()
  .catch((err) => {
    console.error("Fallo general del import:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
