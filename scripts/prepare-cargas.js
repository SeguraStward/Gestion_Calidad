/**
 * Limpia y normaliza el archivo Codex_Info/cargas.csv.
 * - Lee en latin1 para reparar acentos.
 * - Separa los 9 bloques (uno por escuela) usando los encabezados repetidos.
 * - Agrega columna Campus según el orden de hojas.
 * - Calcula cupo_dispo si falta.
 * - Exporta CSV normalizado y JSON.
 *
 * Ejecutar con:
 *   node scripts/prepare-cargas.js
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const INPUT = path.resolve("Codex_Info/cargas.csv");
const OUTPUT_CSV = path.resolve("Codex_Info/cargas_normalized.csv");
const OUTPUT_JSON = path.resolve("Codex_Info/cargas_normalized.json");
const OUTPUT_META = path.resolve("Codex_Info/cargas_meta.json");

// Orden de hojas que compartiste
const CAMPUS_BY_BLOCK = [
  "Educología",
  "Administración",
  "SPH",
  "EG",
  "EN",
  "FL",
  "RB",
  "SL",
  "CA",
];

const HEADER_PREFIX = "Curso;Part";
const PAD_COLUMNS = 17; // columnas esperadas

function parseNumber(value) {
  if (!value) return null;
  const sanitized = value.replace(",", ".").trim();
  if (sanitized.toLowerCase() === "null") return null;
  const n = Number(sanitized);
  return Number.isFinite(n) ? n : null;
}

function isSeparatorLine(line) {
  const trimmed = line.trim();
  return trimmed.length > 0 && new Set(trimmed).size === 1 && trimmed[0] === ";";
}

function splitCourse(raw) {
  const parts = raw.split(/\s+/);
  const code = parts.shift() ?? "";
  const name = parts.join(" ").trim() || raw;
  return { code, name };
}

function normalize() {
  const raw = fs.readFileSync(INPUT, { encoding: "latin1" });
  const lines = raw.split(/\r?\n/);

  let blockIndex = -1;
  const rows = [];
  const warnings = [];
  let skipped = 0;

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith(HEADER_PREFIX)) {
      blockIndex += 1;
      continue;
    }
    if (blockIndex < 0) continue; // antes del primer header
    if (isSeparatorLine(line)) continue;

    const columns = line.split(";");
    while (columns.length < PAD_COLUMNS) columns.push("");

    const [
      curso,
      periodo,
      nrc,
      nivel,
      grupo,
      cupoActual,
      cupoMin,
      cupoMat,
      cupoDispo,
      credCobr,
      tipoHorario,
      metEducativo,
      dias,
      horas,
      edificio,
      aula,
      profesor,
    ] = columns.map((c) => c?.trim() ?? "");

    const campus = CAMPUS_BY_BLOCK[blockIndex] || `Campus-${blockIndex + 1}`;
    const { code: cursoCodigo, name: cursoNombre } = splitCourse(curso);

    const cupoMax = parseNumber(cupoMin);
    const inscritos = parseNumber(cupoMat);
    const computedDispo =
      cupoMax != null && inscritos != null ? cupoMax - inscritos : null;
    const dispo = computedDispo ?? parseNumber(cupoDispo);

    // Ignorar filas basura sin código/curso/profesor/NRC
    const sanitizedName = cursoNombre.replace(/[\x00-\x1F]/g, "").trim();
    const invalidCodigo =
      !cursoCodigo ||
      /^[\x00-\x1F]+$/.test(cursoCodigo) ||
      cursoCodigo === "\u001a";
    if (invalidCodigo && !profesor && !nrc && !sanitizedName) {
      skipped += 1;
      continue;
    }

    const row = {
      campus,
      cursoCodigo,
      cursoNombre,
      periodo,
      nrc,
      nivel: parseNumber(nivel),
      grupo,
      cupoMax,
      cupoMat: inscritos,
      cupoDispo: dispo,
      credCobr: parseNumber(credCobr),
      tipoHorario,
      metEducativo,
      dias,
      horas,
      edificio,
      aula,
      profesor,
    };

    if (!curso) warnings.push({ type: "curso_vacio", row });
    if (!cursoCodigo) warnings.push({ type: "curso_sin_codigo", row });
    if (!profesor) warnings.push({ type: "profesor_vacio", row });

    rows.push(row);
  }

  return { rows, warnings, blocks: blockIndex + 1, skipped };
}

function toCsv(rows) {
  const headers = [
    "campus",
    "curso_codigo",
    "curso_nombre",
    "periodo",
    "nrc",
    "nivel",
    "grupo",
    "cupo_max",
    "cupo_mat",
    "cupo_dispo",
    "cred_cobr",
    "tipo_horario",
    "met_educativo",
    "dias",
    "horas",
    "edificio",
    "aula",
    "profesor",
  ];

  const lines = [headers.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.campus,
        r.cursoCodigo,
        r.cursoNombre,
        r.periodo,
        r.nrc,
        r.nivel ?? "",
        r.grupo,
        r.cupoMax ?? "",
        r.cupoMat ?? "",
        r.cupoDispo ?? "",
        r.credCobr ?? "",
        r.tipoHorario,
        r.metEducativo,
        r.dias,
        r.horas,
        r.edificio,
        r.aula,
        r.profesor,
      ].join(";")
    );
  }
  return lines.join("\n");
}

function main() {
  const { rows, warnings, blocks, skipped } = normalize();
  fs.writeFileSync(OUTPUT_CSV, toCsv(rows), { encoding: "utf-8" });
  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify({ rows, warnings, skipped }, null, 2)
  );
  fs.writeFileSync(
    OUTPUT_META,
    JSON.stringify({ skipped, blocks, warnings: warnings.length }, null, 2)
  );

  // Resumen breve
  const countByCampus = rows.reduce((acc, r) => {
    acc[r.campus] = (acc[r.campus] || 0) + 1;
    return acc;
  }, {});

  console.log(`Bloques detectados: ${blocks}`);
  console.log("Filas por campus:", countByCampus);
  console.log(`Total filas: ${rows.length}`);
  console.log(`Warnings: ${warnings.length} (guardados en el JSON)`);
  if (skipped) console.log(`Filas ignoradas (basura): ${skipped}`);
}

const invokedDirectly =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  main();
}
