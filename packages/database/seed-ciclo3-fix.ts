import { PrismaClient } from "./prisma/generated/client"
const prisma = new PrismaClient()

async function main() {
  const campus = await prisma.campus.findFirst({ where: { status: "ACTIVE" } })
  if (!campus) throw new Error("No campus activo")

  const cycle = await prisma.academicCycle.findFirst({ where: { code: "2026-III" } })
  if (!cycle) throw new Error("Ciclo 2026-III no encontrado")

  const group = await prisma.academicLoadGroup.findFirst({ where: { number: "80" } })
  if (!group) throw new Error("Grupo 80 no encontrado")

  // ── 1. Crear profesores faltantes ──────────────────────────────────────
  console.log("--- Profesores ---")

  const professorData = [
    { fullName: "Roberto", fullLastName: "Arguedas Zuniga",    email: "roberto.arguedas.zuniga@una.ac.cr" },
    { fullName: "Daniel",  fullLastName: "Barrantes Garbanzo", email: "daniel.barrantes.garbanzo@una.ac.cr" },
  ]

  const profMap: Record<string, string> = {}

  for (const p of professorData) {
    let user = await prisma.user.findFirst({ where: { email: p.email } })
    if (!user) {
      user = await prisma.user.create({
        data: { fullName: p.fullName, fullLastName: p.fullLastName, email: p.email, status: "ACTIVE" },
      })
      console.log(`  ✓ Creado: ${p.fullName} ${p.fullLastName} | ${p.email}`)
    } else {
      console.log(`  → Ya existe: ${p.fullName} ${p.fullLastName}`)
    }
    profMap[p.email] = user.id
  }

  // ── 2. Cargas pendientes ───────────────────────────────────────────────
  console.log("\n--- Cargas académicas ---")

  // NRC 90059 existía pero en Ciclo II / CS101 → crear para III Ciclo con ETA403
  // NRC 90117 → SPH202 / Roberto Arguedas
  // NRC 90056 → MAT002 / Daniel Barrantes
  const pending = [
    { nrc: "90059", courseCode: "ETA403", maxCap: 25, enrolled: 21, available: 4,  schedule: "M 0800-1030",    profEmail: "" /* buscar por nombre */ },
    { nrc: "90117", courseCode: "SPH202", maxCap: 19, enrolled: 8,  available: 11, schedule: "M 0800-1120",    profEmail: "roberto.arguedas.zuniga@una.ac.cr" },
    { nrc: "90056", courseCode: "MAT002", maxCap: 40, enrolled: 40, available: 0,  schedule: "M-J 1300-1710",  profEmail: "daniel.barrantes.garbanzo@una.ac.cr" },
  ]

  for (const load of pending) {
    const course = await prisma.course.findFirst({ where: { code: load.courseCode } })
    if (!course) { console.log(`  ✗ Curso ${load.courseCode} no encontrado`); continue }

    let professorId: string | undefined

    if (load.profEmail) {
      professorId = profMap[load.profEmail]
    } else {
      // ALCIDES ARIAS ZUNIGA (NRC 90059) — ya estaba en el sistema
      const p = await prisma.user.findFirst({
        where: {
          fullName:     { contains: "Alcides", mode: "insensitive" },
          fullLastName: { contains: "Arias",   mode: "insensitive" },
        },
      })
      professorId = p?.id
    }

    if (!professorId) { console.log(`  ✗ Profesor no hallado para NRC ${load.nrc}`); continue }

    // Horario
    let schedule = await prisma.schedule.findFirst({
      where: { name: { equals: load.schedule, mode: "insensitive" } },
    })
    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: { name: load.schedule, day: "MONDAY", startTime: "08:00", endTime: "10:00" },
      })
    }

    // Verificar que no exista en este ciclo
    const existing = await prisma.academicLoad.findFirst({
      where: { nrc: load.nrc, academicCycleId: cycle.id },
    })
    if (existing) { console.log(`  → NRC ${load.nrc} ya existe en III Ciclo`); continue }

    await prisma.academicLoad.create({
      data: {
        nrc:              load.nrc,
        maximumCapacity:  load.maxCap,
        enrolledCapacity: load.enrolled,
        availableSeats:   load.available,
        status:           "ACTIVE",
        academicCycle:    { connect: { id: cycle.id } },
        campus:           { connect: { id: campus.id } },
        course:           { connect: { id: course.id } },
        group:            { connect: { id: group.id } },
        professor:        { connect: { id: professorId } },
        schedule:         { connect: { id: schedule.id } },
      },
    })
    console.log(`  ✓ NRC ${load.nrc} | ${load.courseCode} creado`)
  }

  console.log("\n✓ Completado")
}

main().catch(console.error).finally(() => prisma.$disconnect())
