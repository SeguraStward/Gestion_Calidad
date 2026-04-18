/**
 * Seed Brunca 2026 — datos realistas para demo del módulo Tiempos de Jornada.
 *
 * Crea (idempotente, usa upsert/findFirst):
 *   - Campus: Pérez Zeledón + Coto
 *   - Ciclos: 2026-I, 2026-II
 *   - Carreras: Ingeniería Sistemas, Turismo Sostenible, Inglés
 *   - Cursos con contactHours reales (para tabla horas→jornada)
 *   - Mallas curriculares con cursos por ciclo
 *   - Config de cálculo horas→jornada (si no existe)
 *   - Asignación anual 2026 (80 jornadas base)
 *   - 3 profesores demo
 *   - Asignaciones de profesores a cursos (ProfessorAssignment con calculatedJourneyTime)
 *   - CourseReports finales (semestre pasado, para generar alertas)
 *   - 1 proveedor externo (Observatorio +1.16j)
 *   - 1 proyecto institucional (Accesibilidad Turística 0.25j/año)
 *   - 2 cohortes por carrera (2024-A, 2024-B)
 *
 * Ejecutar:
 *   pnpm dotenv -e apps/backend/.env -- tsx packages/database/seed-brunca.ts
 */

import { PrismaClient } from './prisma/generated/client'

const prisma = new PrismaClient()

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsertCampus(name: string, code: string) {
  let campus = await prisma.campus.findFirst({ where: { name } })
  if (!campus) {
    campus = await prisma.campus.create({ data: { name, code, status: 'ACTIVE' } as any })
    console.log(`  ✓ Campus: ${name}`)
  } else {
    console.log(`  → Campus ya existe: ${name}`)
  }
  return campus
}

async function upsertCareer(name: string, code: string) {
  let career = await prisma.career.findFirst({ where: { name } })
  if (!career) {
    career = await prisma.career.create({ data: { name, code, status: 'ACTIVE' } as any })
    console.log(`  ✓ Carrera: ${name}`)
  } else {
    console.log(`  → Carrera ya existe: ${name}`)
  }
  return career
}

async function upsertCycle(code: string, name: string, year: number) {
  let cycle = await prisma.academicCycle.findUnique({ where: { code } })
  if (!cycle) {
    cycle = await prisma.academicCycle.create({ data: { code, name, year, status: 'ACTIVE' } as any })
    console.log(`  ✓ Ciclo: ${name}`)
  } else {
    console.log(`  → Ciclo ya existe: ${name}`)
  }
  return cycle
}

async function upsertCourse(code: string, name: string, contactHours: number, careerId: string) {
  let course = await prisma.course.findUnique({ where: { code } })
  if (!course) {
    course = await prisma.course.create({
      data: { code, name, contactHours, credits: Math.ceil(contactHours / 3), level: 1, careerId, status: 'ACTIVE' } as any
    })
    console.log(`  ✓ Curso: ${code} - ${name} (${contactHours}h contacto)`)
  } else {
    console.log(`  → Curso ya existe: ${code}`)
  }
  return course
}

async function upsertMesh(careerId: string, startYear: number) {
  let mesh = await prisma.curricularMesh.findFirst({ where: { careerId, startYear } })
  if (!mesh) {
    mesh = await prisma.curricularMesh.create({
      data: { careerId, startYear, name: `Malla ${startYear}`, isActive: true, status: 'ACTIVE' } as any
    })
    console.log(`  ✓ Malla ${startYear} para carrera ${careerId}`)
  }
  return mesh
}

async function upsertMeshCourse(meshId: string, courseId: string, cycleId: string, isRepeat = false) {
  let mc = await prisma.curricularMeshCourse.findFirst({ where: { curricularMeshId: meshId, courseId, academicCycleId: cycleId } })
  if (!mc) {
    mc = await prisma.curricularMeshCourse.create({
      data: { curricularMeshId: meshId, courseId, academicCycleId: cycleId, isRequired: true, isRepeatOffering: isRepeat, status: 'ACTIVE' } as any
    })
  }
  return mc
}

async function upsertProfessor(fullName: string, email: string, nationalId: string) {
  let prof = await prisma.user.findFirst({ where: { email } })
  if (!prof) {
    prof = await prisma.user.create({
      data: { fullName, email, nationalId, status: 'ACTIVE' } as any
    })
    console.log(`  ✓ Profesor: ${fullName}`)
  } else {
    console.log(`  → Profesor ya existe: ${fullName}`)
  }
  return prof
}

// Calcula jornada según contactHours y la config activa
function calcJourneyTime(contactHours: number, config: any): number {
  if (contactHours <= config.quarterTimeMaxHours) return config.quarterTimeValue
  if (contactHours <= config.halfTimeMaxHours) return config.halfTimeValue
  if (contactHours <= config.threeQuarterMaxHours) return config.threeQuarterTimeValue
  return config.fullTimeValue
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Seed Brunca 2026 ===\n')

  // ── Config horas→jornada ───────────────────────────────────────────────────
  console.log('--- Config cálculo ---')
  let config = await prisma.journeyTimeCalculationConfig.findFirst({ where: { isActive: true } })
  if (!config) {
    config = await prisma.journeyTimeCalculationConfig.create({
      data: {
        effectiveYear: 2026,
        isActive: true,
        quarterTimeMinHours: 1,  quarterTimeMaxHours: 5,  quarterTimeValue: 0.25,
        halfTimeMinHours: 6,     halfTimeMaxHours: 8,     halfTimeValue: 0.5,
        threeQuarterMinHours: 9, threeQuarterMaxHours: 11, threeQuarterTimeValue: 0.75,
        fullTimeMinHours: 12,    fullTimeValue: 1.0,
        status: 'ACTIVE',
      } as any
    })
    console.log('  ✓ Config creada')
  } else {
    console.log(`  → Config ya existe (año ${config.effectiveYear})`)
  }

  // ── Campus ─────────────────────────────────────────────────────────────────
  console.log('\n--- Campus ---')
  const perez  = await upsertCampus('Pérez Zeledón', 'PZ')
  const coto   = await upsertCampus('Coto', 'COTO')

  // ── Ciclos 2026 ────────────────────────────────────────────────────────────
  console.log('\n--- Ciclos académicos ---')
  const ciclo1 = await upsertCycle('2026-I', 'I Ciclo 2026', 2026)
  const ciclo2 = await upsertCycle('2026-II', 'II Ciclo 2026', 2026)

  // ── Carreras ───────────────────────────────────────────────────────────────
  console.log('\n--- Carreras ---')
  const sistemas = await upsertCareer('Ingeniería en Sistemas', 'IS')
  const turismo  = await upsertCareer('Gestión Empresarial Turismo Sostenible', 'GETS')
  const ingles   = await upsertCareer('Inglés', 'ING')

  // ── Cursos con contactHours ─────────────────────────────────────────────────
  console.log('\n--- Cursos ---')
  // Sistemas
  const prog1   = await upsertCourse('SIS101', 'Programación I',          4, sistemas.id)  // 4h → ¼
  const prog2   = await upsertCourse('SIS102', 'Programación II',         4, sistemas.id)  // 4h → ¼
  const discretas = await upsertCourse('SIS201', 'Matemáticas Discretas', 4, sistemas.id)  // 4h → ¼
  const bd      = await upsertCourse('SIS202', 'Bases de Datos',          7, sistemas.id)  // 7h → ½
  const edata   = await upsertCourse('SIS301', 'Estructuras de Datos',    7, sistemas.id)  // 7h → ½

  // Turismo
  const tss     = await upsertCourse('TUR101', 'Taller Sistemas Turísticos', 5, turismo.id) // 5h → ¼
  const geo     = await upsertCourse('TUR102', 'Geografía Turística',         5, turismo.id) // 5h → ¼
  const ingTur  = await upsertCourse('TUR103', 'Inglés para Turismo',        10, turismo.id) // 10h → ¾
  const gestion = await upsertCourse('TUR201', 'Gestión Turismo Alternativo', 5, turismo.id) // 5h → ¼

  // Inglés
  const ingA    = await upsertCourse('ING101', 'Inglés I',  10, ingles.id)   // 10h → ¾
  const ingB    = await upsertCourse('ING102', 'Inglés II', 10, ingles.id)   // 10h → ¾

  // ── Mallas curriculares ────────────────────────────────────────────────────
  console.log('\n--- Mallas curriculares ---')
  const meshSis = await upsertMesh(sistemas.id, 2023)
  const meshTur = await upsertMesh(turismo.id, 2023)
  const meshIng = await upsertMesh(ingles.id, 2023)

  // Sistemas: Ciclo I → prog1, discretas; Ciclo II → prog2, bd; Ciclo II repitencia → prog1
  await upsertMeshCourse(meshSis.id, prog1.id, ciclo1.id)
  await upsertMeshCourse(meshSis.id, discretas.id, ciclo1.id)
  await upsertMeshCourse(meshSis.id, prog2.id, ciclo2.id)
  await upsertMeshCourse(meshSis.id, bd.id, ciclo2.id)
  await upsertMeshCourse(meshSis.id, edata.id, ciclo2.id)
  await upsertMeshCourse(meshSis.id, prog1.id, ciclo2.id, true) // repitencia

  // Turismo: Ciclo I → tss, geo, ingTur; Ciclo II → gestion
  await upsertMeshCourse(meshTur.id, tss.id, ciclo1.id)
  await upsertMeshCourse(meshTur.id, geo.id, ciclo1.id)
  await upsertMeshCourse(meshTur.id, ingTur.id, ciclo1.id)
  await upsertMeshCourse(meshTur.id, gestion.id, ciclo2.id)

  // Inglés: Ciclo I → ingA; Ciclo II → ingB
  await upsertMeshCourse(meshIng.id, ingA.id, ciclo1.id)
  await upsertMeshCourse(meshIng.id, ingB.id, ciclo2.id)

  // ── Profesores ─────────────────────────────────────────────────────────────
  console.log('\n--- Profesores ---')
  const profDouglas  = await upsertProfessor('Douglas Ramírez Solano',   'douglas.ramirez@una.ac.cr',  '100100100')
  const profMaría    = await upsertProfessor('María González Rojas',     'maria.gonzalez@una.ac.cr',   '200200200')
  const profAndres   = await upsertProfessor('Andrés Mora Ureña',        'andres.mora@una.ac.cr',      '300300300')

  // ── Asignación anual 2026 ─────────────────────────────────────────────────
  console.log('\n--- Asignación anual ---')
  let annual = await prisma.annualJourneyTimeAllocation.findFirst({ where: { year: 2026 } })
  if (!annual) {
    annual = await prisma.annualJourneyTimeAllocation.create({
      data: { year: 2026, totalJourneyTime: 80, status: 'ACTIVE', description: 'Presupuesto Brunca 2026' } as any
    })
    console.log('  ✓ Asignación anual 2026: 80 jornadas')
  } else {
    console.log(`  → Asignación anual ya existe (${annual.totalJourneyTime}j)`)
  }

  // ── Proveedor externo ─────────────────────────────────────────────────────
  console.log('\n--- Proveedor externo ---')
  let provider = await prisma.externalProvider.findFirst({ where: { name: 'Observatorio Brunca' } })
  if (!provider) {
    provider = await prisma.externalProvider.create({
      data: {
        name: 'Observatorio Brunca',
        description: 'Tiempos que traslada el Observatorio Regional a Sede Brunca',
        providerType: 'EXTERNAL',
        providedJourneyTime: 1.16,
        isFixedTime: false,
        annualAllocationId: annual.id,
        status: 'ACTIVE',
      } as any
    })
    console.log('  ✓ Proveedor: Observatorio Brunca (+1.16j)')
  } else {
    console.log('  → Proveedor ya existe')
  }

  // ── Asignación por campus (Pérez Zeledón) ─────────────────────────────────
  console.log('\n--- Asignación campus ---')
  let campusAlloc = await prisma.campusJourneyTimeAllocation.findFirst({
    where: { annualAllocationId: annual.id, campusId: perez.id, academicCycleId: ciclo1.id }
  })
  if (!campusAlloc) {
    campusAlloc = await prisma.campusJourneyTimeAllocation.create({
      data: {
        annualAllocationId: annual.id,
        campusId: perez.id,
        academicCycleId: ciclo1.id,
        allocatedJourneyTime: 40,
        baseJourneyTimeConsumed: 0,
        status: 'ACTIVE',
        description: 'Pérez Zeledón - I Ciclo 2026',
      } as any
    })
    console.log('  ✓ Asignación Pérez Zeledón - I Ciclo 2026')
  } else {
    console.log('  → Asignación campus ya existe')
  }

  // ── Proyecto institucional ────────────────────────────────────────────────
  console.log('\n--- Proyecto institucional ---')
  let project = await prisma.institutionalProject.findFirst({ where: { code: 'PROY-ACC-TUR-2025' } })
  if (!project) {
    project = await prisma.institutionalProject.create({
      data: {
        code: 'PROY-ACC-TUR-2025',
        title: 'Accesibilidad Turística Brunca',
        projectType: 'EXTENSION',
        requiredJourneyTime: 0.25,
        assignedJourneyTime: 0.25,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-06-30'),
        campusAllocationId: campusAlloc.id,
        directorId: profMaría.id,
        projectStatus: 'ACTIVE',
        status: 'ACTIVE',
      } as any
    })
    console.log('  ✓ Proyecto: Accesibilidad Turística (0.25j, cierra jun 2026)')
  } else {
    console.log('  → Proyecto ya existe')
  }

  // ── ProfessorAssignments (el corazón de la demo) ──────────────────────────
  console.log('\n--- Asignaciones de profesores ---')

  const meshCourses = await prisma.curricularMeshCourse.findMany({
    where: {
      curricularMeshId: { in: [meshSis.id, meshTur.id, meshIng.id] },
    },
    include: { course: true, curricularMesh: { include: { career: true } } }
  })

  const mcMap = new Map(
    meshCourses.map((mc) => [`${mc.curricularMeshId}::${mc.courseId}::${mc.academicCycleId}`, mc])
  )

  const assignmentDefs = [
    // Sistemas - Ciclo I: Douglas da prog1 (4h→0.25) + discretas (4h→0.25) = 8h → ½
    { prof: profDouglas, meshId: meshSis.id, courseId: prog1.id, cycleId: ciclo1.id, campus: perez },
    { prof: profDouglas, meshId: meshSis.id, courseId: discretas.id, cycleId: ciclo1.id, campus: perez },
    // Sistemas - Ciclo II: Douglas da prog2 (4h) + bd (7h) = 11h → ¾
    { prof: profDouglas, meshId: meshSis.id, courseId: prog2.id, cycleId: ciclo2.id, campus: perez },
    { prof: profDouglas, meshId: meshSis.id, courseId: bd.id, cycleId: ciclo2.id, campus: perez },
    // Sistemas - Ciclo II: María da edata (7h→½) + repitencia prog1 (4h→0.25)
    { prof: profMaría, meshId: meshSis.id, courseId: edata.id, cycleId: ciclo2.id, campus: perez },
    // Turismo - Ciclo I: Andrés da tss (5h→0.25) + geo (5h→0.25) + ingTur (10h→0.75)
    { prof: profAndres, meshId: meshTur.id, courseId: tss.id, cycleId: ciclo1.id, campus: perez },
    { prof: profAndres, meshId: meshTur.id, courseId: geo.id, cycleId: ciclo1.id, campus: perez },
    { prof: profAndres, meshId: meshTur.id, courseId: ingTur.id, cycleId: ciclo1.id, campus: perez },
    // Turismo - Ciclo II: Andrés da gestion (5h→0.25)
    { prof: profAndres, meshId: meshTur.id, courseId: gestion.id, cycleId: ciclo2.id, campus: perez },
    // Inglés - Ciclo I: María da ingA (10h→0.75)
    { prof: profMaría, meshId: meshIng.id, courseId: ingA.id, cycleId: ciclo1.id, campus: perez },
    // Inglés - Ciclo II: María da ingB (10h→0.75)
    { prof: profMaría, meshId: meshIng.id, courseId: ingB.id, cycleId: ciclo2.id, campus: perez },
  ]

  for (const def of assignmentDefs) {
    const mcKey = `${def.meshId}::${def.courseId}::${def.cycleId}`
    const mc = mcMap.get(mcKey)
    if (!mc) {
      console.log(`  ✗ MeshCourse no encontrado: ${mcKey}`)
      continue
    }

    const existing = await prisma.professorAssignment.findFirst({
      where: { professorId: def.prof.id, academicCycleId: def.cycleId, curricularMeshCourseId: mc.id }
    })
    if (existing) {
      console.log(`  → Asignación ya existe: ${def.prof.fullName} → ${mc.course.code}`)
      continue
    }

    const contactH = mc.course.contactHours
    const journeyTime = calcJourneyTime(contactH, config)
    const isRepeat = mc.isRepeatOffering

    await prisma.professorAssignment.create({
      data: {
        professorId: def.prof.id,
        academicCycleId: def.cycleId,
        campusId: def.campus.id,
        curricularMeshCourseId: mc.id,
        curricularMeshId: def.meshId,
        assignmentType: isRepeat ? 'REPEAT_COURSE' as any : 'REGULAR_COURSE' as any,
        calculatedJourneyTime: journeyTime,
        campusAllocationId: campusAlloc.id,
        status: 'ACTIVE',
      } as any
    })
    console.log(`  ✓ ${def.prof.fullName} → ${mc.course.code} (${contactH}h → ${journeyTime}j${isRepeat ? ' [repitencia]' : ''})`)
  }

  // ── CourseReports 2025 para generar alertas ────────────────────────────────
  console.log('\n--- CourseReports 2025 (para alertas) ---')
  const ciclo2025II = await upsertCycle('2025-II', 'II Ciclo 2025', 2025)

  const reportDefs = [
    { courseId: prog1.id, matriculados: 40, aprobados: 17, reprobados: 23 }, // ≥20 → alerta
    { courseId: discretas.id, matriculados: 35, aprobados: 25, reprobados: 10 },
    { courseId: ingA.id, matriculados: 30, aprobados: 22, reprobados: 8 },
    { courseId: tss.id, matriculados: 28, aprobados: 24, reprobados: 4 },
  ]

  for (const r of reportDefs) {
    const existing = await prisma.courseReport.findFirst({
      where: {
        courseId: r.courseId,
        academicCycleId: ciclo2025II.id,
        campusId: perez.id,
        professorId: profDouglas.id,
        isFinal: true,
      }
    })
    if (!existing) {
      await prisma.courseReport.create({
        data: {
          courseId: r.courseId,
          academicCycleId: ciclo2025II.id,
          campusId: perez.id,
          professorId: profDouglas.id,
          matriculados: r.matriculados,
          aprobados: r.aprobados,
          reprobados: r.reprobados,
          isFinal: true,
          status: 'SUBMITTED',
        } as any
      })
      console.log(`  ✓ Reporte 2025-II: curso ${r.courseId} — ${r.reprobados} reprobados`)
    }
  }

  // ── Cohortes ───────────────────────────────────────────────────────────────
  console.log('\n--- Cohortes ---')
  for (const carrera of [sistemas, turismo, ingles]) {
    for (const group of ['A', 'B']) {
      const existing = await prisma.cohort.findFirst({
        where: { careerId: carrera.id, year: 2024, group }
      })
      if (!existing) {
        await prisma.cohort.create({
          data: { careerId: carrera.id, year: 2024, group, initialStudents: 35, status: 'ACTIVE' } as any
        })
        console.log(`  ✓ Cohorte 2024-${group}: ${carrera.name}`)
      } else {
        console.log(`  → Cohorte ya existe: ${carrera.name} 2024-${group}`)
      }
    }
  }

  console.log('\n=== Seed completado ===')
  console.log('\nPara ver el resumen de jornadas, navega a:')
  console.log('  /times-management/summary?year=2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
