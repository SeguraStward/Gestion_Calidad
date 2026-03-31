import { PrismaClient } from "./prisma/generated/client"

const prisma = new PrismaClient()

// ── Datos del III Ciclo (Verano 2026) ──────────────────────────────────────

const CYCLE = {
  code: "2026-III",
  name: "III Ciclo",
  year: 2026,
  description: "Tercer ciclo lectivo - Verano 2026",
}

const COURSES = [
  { code: "ETA403", name: "FINANZAS EMPRESARIALES",       credits: 3, level: 1, contactHours: 3 },
  { code: "SPH202", name: "INGLES GEST COMERC Y ADMI",    credits: 3, level: 1, contactHours: 3 },
  { code: "MAT002", name: "CALCULO I",                    credits: 4, level: 1, contactHours: 4 },
  { code: "EIF201", name: "PROGRAMACION I",               credits: 4, level: 1, contactHours: 4 },
  { code: "EIF409", name: "APLICACIONES INFORMAT",        credits: 4, level: 4, contactHours: 4 },
  { code: "LIX410", name: "INGLES INTEG OTRAS CARRERAS I",  credits: 4, level: 0, contactHours: 4 },
  { code: "LIX411", name: "INGLES INTEG OTRAS CARRERAS II", credits: 4, level: 0, contactHours: 4 },
  { code: "SCC408", name: "INTROD. FINANZAS PARA TURISMO",  credits: 3, level: 2, contactHours: 3 },
]

const GROUP_NUMBER = "80"

const LOADS = [
  { nrc: "90059", courseCode: "ETA403", maxCap: 25, enrolled: 21, available: 4,  schedule: "M 0800-1030",         professorName: "ALCIDES ARIAS ZUNIGA"     },
  { nrc: "90117", courseCode: "SPH202", maxCap: 19, enrolled: 8,  available: 11, schedule: "M 0800-1120",         professorName: "ROBERTO ARGUEDAS ZUNIGA"  },
  { nrc: "90056", courseCode: "MAT002", maxCap: 40, enrolled: 40, available: 0,  schedule: "M-J 1300-1710",       professorName: "DANIEL BARRANTES GARBANZO"},
  { nrc: "90058", courseCode: "EIF201", maxCap: 40, enrolled: 25, available: 15, schedule: "1700-2020",           professorName: "RUBEN MORA VARGAS"        },
  { nrc: "90057", courseCode: "EIF409", maxCap: 20, enrolled: 20, available: 0,  schedule: "L 0800-1200 / 1300-1620", professorName: "SARAY CASTRO MORA"    },
  { nrc: "90054", courseCode: "LIX410", maxCap: 30, enrolled: 31, available: -1, schedule: "L-M-J 0800-1030/1120",professorName: "KARLA HERRERA RODRIGUEZ"  },
  { nrc: "90111", courseCode: "LIX411", maxCap: 25, enrolled: 25, available: 0,  schedule: "L-M-J 0800-1030/1120",professorName: "YANIRIAN HERNANDEZ PARRA" },
  { nrc: "90061", courseCode: "SCC408", maxCap: 23, enrolled: 18, available: 5,  schedule: "M 1700-1930",         professorName: "CESAR DELGADO BARBOZA"    },
]

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Busca un profesor por nombre completo probando distintas combinaciones de
 * fullName / fullLastName (nombre + primer apellido + segundo apellido).
 */
async function findProfessorByName(fullNameStr: string) {
  const parts = fullNameStr.trim().split(/\s+/)
  // Típicamente: [nombre, primerApellido, segundoApellido]
  const firstName = parts[0]
  const restName  = parts.slice(1).join(" ")
  const lastWord  = parts[parts.length - 1]

  // 1. fullName = "NOMBRE" y fullLastName contiene ambos apellidos
  let prof = await prisma.user.findFirst({
    where: {
      fullName:     { equals: firstName, mode: "insensitive" },
      fullLastName: { contains: restName.split(" ")[0], mode: "insensitive" },
    },
  })
  if (prof) return { prof, strategy: 1 }

  // 2. fullName contiene el nombre y fullLastName contiene el resto
  prof = await prisma.user.findFirst({
    where: {
      fullName:     { contains: firstName, mode: "insensitive" },
      fullLastName: { contains: restName, mode: "insensitive" },
    },
  })
  if (prof) return { prof, strategy: 2 }

  // 3. fullLastName contiene el último apellido y fullName el primero
  prof = await prisma.user.findFirst({
    where: {
      fullName:     { contains: firstName,  mode: "insensitive" },
      fullLastName: { contains: lastWord,   mode: "insensitive" },
    },
  })
  if (prof) return { prof, strategy: 3 }

  return null
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Seed: III Ciclo (Verano 2026) ===\n")

  // ── Campus ────────────────────────────────────────────────────────────────
  const campus = await prisma.campus.findFirst({ where: { status: "ACTIVE" } })
  if (!campus) throw new Error("No se encontró ningún campus activo en la base de datos.")
  console.log(`Campus usado: ${campus.name ?? campus.code} (id: ${campus.id})\n`)

  // ── Ciclo académico ───────────────────────────────────────────────────────
  let cycle = await prisma.academicCycle.findFirst({ where: { code: CYCLE.code } })
  if (!cycle) {
    cycle = await prisma.academicCycle.create({ data: { ...CYCLE, status: "ACTIVE" } })
    console.log(`✓ Ciclo creado: ${cycle.name} (${cycle.code})`)
  } else {
    console.log(`→ Ciclo ya existe: ${cycle.name} (${cycle.code})`)
  }

  // ── Grupo 80 ──────────────────────────────────────────────────────────────
  let group = await prisma.academicLoadGroup.findFirst({ where: { number: GROUP_NUMBER } })
  if (!group) {
    group = await prisma.academicLoadGroup.create({
      data: { number: GROUP_NUMBER, status: "ACTIVE" },
    })
    console.log(`✓ Grupo creado: ${GROUP_NUMBER}`)
  } else {
    console.log(`→ Grupo ${GROUP_NUMBER} ya existe`)
  }

  // ── Cursos ────────────────────────────────────────────────────────────────
  console.log("\n--- Cursos ---")
  const courseMap: Record<string, string> = {}
  for (const c of COURSES) {
    let course = await prisma.course.findFirst({ where: { code: c.code } })
    if (!course) {
      course = await prisma.course.create({ data: { ...c, status: "ACTIVE" } })
      console.log(`  ✓ Creado: ${c.code} – ${c.name}`)
    } else {
      console.log(`  → Ya existe: ${c.code}`)
    }
    courseMap[c.code] = course.id
  }

  // ── Cargas académicas ─────────────────────────────────────────────────────
  console.log("\n--- Cargas académicas ---")
  let created = 0
  let alreadyExists = 0
  let profNotFound = 0

  for (const load of LOADS) {
    // Buscar profesor
    const result = await findProfessorByName(load.professorName)
    if (!result) {
      console.log(`  ✗ Profesor no encontrado: "${load.professorName}" → NRC ${load.nrc} omitido`)
      profNotFound++
      continue
    }
    const { prof, strategy } = result

    // Buscar/crear horario
    let scheduleId: string | undefined
    if (load.schedule) {
      let schedule = await prisma.schedule.findFirst({
        where: { name: { equals: load.schedule, mode: "insensitive" } },
      })
      if (!schedule) {
        schedule = await prisma.schedule.create({
          data: {
            name:      load.schedule,
            day:       "MONDAY",  // valor requerido por schema; la descripción real está en 'name'
            startTime: "08:00",
            endTime:   "10:00",
          },
        })
      }
      scheduleId = schedule.id
    }

    // Verificar si ya existe la carga por NRC
    const existing = await prisma.academicLoad.findFirst({ where: { nrc: load.nrc } })
    if (existing) {
      console.log(`  → NRC ${load.nrc} ya existe (omitido)`)
      alreadyExists++
      continue
    }

    // Crear carga
    await prisma.academicLoad.create({
      data: {
        nrc:              load.nrc,
        maximumCapacity:  load.maxCap,
        enrolledCapacity: load.enrolled,
        availableSeats:   load.available,
        status:           "ACTIVE",
        academicCycle:    { connect: { id: cycle.id } },
        campus:           { connect: { id: campus.id } },
        course:           { connect: { id: courseMap[load.courseCode] } },
        group:            { connect: { id: group.id } },
        professor:        { connect: { id: prof.id } },
        ...(scheduleId && { schedule: { connect: { id: scheduleId } } }),
      },
    })

    console.log(
      `  ✓ NRC ${load.nrc} | ${load.courseCode} | Profesor: ${prof.fullName} ${prof.fullLastName ?? ""} (estrategia ${strategy})`
    )
    created++
  }

  console.log("\n=== Resumen ===")
  console.log(`  Cargas creadas:          ${created}`)
  console.log(`  Cargas ya existían:      ${alreadyExists}`)
  console.log(`  Profesores no hallados:  ${profNotFound}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
