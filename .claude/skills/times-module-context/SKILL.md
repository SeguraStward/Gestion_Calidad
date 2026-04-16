---
name: times-module-context
description: Contexto maestro del módulo Tiempos de Jornada. Cárgala SIEMPRE que el usuario mencione tiempos, jornadas, cohortes, cursos, profesores, portal profesor, reportes de curso, Erick, Excel Brunca, FASE (1-6), o trabaje en apps/backend/src/modules/{times,cohorts,course-reports,professor-portal,journey-time-configs,journey-time-allocations,repitencias,professor-assignments,external-providers,institutional-projects} o apps/frontend/src/modules/times-management o apps/frontend/src/app/{times-management,portal-profesor}. Define alcance, arquitectura, reglas del Excel y flujo de trabajo.
---

# Módulo Tiempos de Jornada — Contexto maestro

## Alcance: qué te corresponde

**Trabajas ÚNICAMENTE sobre el módulo de Tiempos de Jornada.** No tocar otros dominios (SINAES, comisiones, proyectos finales, documentos, etc.) salvo que el usuario lo pida explícitamente y confirme.

Franko (el usuario) es responsable exclusivo de este módulo dentro del equipo. Cualquier cambio fuera de los paths listados abajo requiere confirmación previa.

### Paths que sí te corresponden

**Backend** (`apps/backend/src/modules/`):
- `times/` — endpoint principal de tiempos
- `cohorts/` — cohortes (carrera + año + grupo + estudiantes iniciales)
- `course-reports/` — lo que llena el profesor (matriculados/aprobados/reprobados)
- `professor-portal/` — portal independiente del profesor (guard propio sin JWT)
- `journey-time-configs/` — configuración de conversión horas → fracción de jornada
- `annual-journey-time-allocations/`, `campus-journey-time-allocations/` — asignación de horas anual y por sede
- `repitencias/` — registros de repitencia
- `professor-assignments/` — asignación profesor ↔ curso
- `external-providers/`, `institutional-projects/` — convenios y proyectos que aportan/consumen horas

**Frontend**:
- `apps/frontend/src/modules/times-management/` — páginas, componentes, services, stores
- `apps/frontend/src/app/times-management/` — rutas (`page.tsx`, `summary/`, `extensions/`, `configuracion/`)
- `apps/frontend/src/app/portal-profesor/` — portal del profesor (ruta independiente)

**Schema** (`packages/database/prisma/schema/`):
- `cohort.prisma`, `cohort-course-projection.prisma`
- `course-report.prisma`
- `journey-time-calculation.prisma`, `journey-time-allocation.prisma`, `journey-time-enums.prisma`
- `professor-portal-token.prisma`
- `professor-assignment.prisma`, `professor-assignment-optimized.prisma`
- `repitencia.prisma`, `external-provider.prisma`, `institutional-project.prisma`

**Documentación académica**: `documentation/Gestion_Calidad_Doc/chapters/` (LaTeX — TFM). Consúltala cuando necesites justificar decisiones o redactar para entrega.

## Arquitectura del proyecto

```
Gestion_Calidad/
├── apps/
│   ├── backend/           NestJS + Prisma (MongoDB)
│   └── frontend/          Next.js 14 (App Router) + Zustand + shadcn/ui
├── packages/
│   ├── database/          Prisma schema + client
│   ├── ui/                Componentes compartidos
│   ├── eslint-config/
│   └── typescript-config/
├── documentation/         TFM en LaTeX
└── turbo.json             Monorepo Turborepo + pnpm
```

### Patrón backend (obligatorio)
Cada módulo CRUD sigue `GenericController → GenericService → GenericPrismaRepository`:
```
modules/<nombre>/
  <nombre>.controller.ts   extiende GenericController
  <nombre>.service.ts      extiende GenericService (o custom para lógica de dominio)
  <nombre>.repository.ts   extiende GenericPrismaRepository
  <nombre>.module.ts
  dtos/
    create-<nombre>.dto.ts
    update-<nombre>.dto.ts
```

### Patrón frontend (obligatorio)
Cada dominio en `modules/times-management/`:
```
services/<nombre>.service.ts       llamadas HTTP tipadas
store/use<Nombre>Store.ts          Zustand store
components/<Pascal>.tsx            componentes atómicos
pages/<nombre>.tsx                 compone la página
```

La ruta vive en `app/times-management/<subruta>/page.tsx` y delega a `pages/*.tsx` del módulo.

## Reglas del Excel "Análisis-Brunca 2026.xlsx"

El sistema reemplaza este Excel de Erick. Lógica obligatoria:

### Conversión horas → fracción de jornada
Configurable en `JourneyTimeCalculationConfig` (default):
- 1–5 h   → **¼** jornada (0.25)
- 6–7 h   → **½** jornada (0.5)
- 8–11 h  → **¾** jornada (0.75)
- 12+ h   → **jornada completa** (1.0)

Horas = T + P + L + G + I (Teoría, Práctica, Laboratorio, Grupal, Investigación).

### Proyección por cohorte
- Cada cohorte (`careerId + year + group`) avanza año a año por los ciclos de la malla curricular.
- `CohortCourseProjection` conecta cohorte → curso → campus → ciclo con `projectedStudents` y `repeatingStudents`.
- **Alerta ≥20 estudiantes proyectados → `recomendaAbrirGrupo` en course-reports.**
- **Rezagados: filtro 2 años** (cursos con reprobados arrastrados).

### Vistas requeridas
- **Vista por carrera**: cohortes, avance por ciclo, cursos esperados.
- **Vista campus**: consolidado de todas las carreras por ciclo y año.
- **Balance**: jornadas disponibles (profesores + convenios + proyectos) vs requeridas (cohortes × cursos).

## Portal del Profesor

Ruta: `/portal-profesor` (independiente, no bajo `/times-management`).

**Autenticación propia, SIN JWT**:
- Profesor ingresa con `cédula + token UUID` (generado admin).
- Guard (`professor-portal.guard`) valida headers: `x-professor-token` + `x-professor-cedula`.
- Modelo: `ProfessorPortalToken` (cédula + token + expiración).

**Flujo**:
1. Profesor entra → ve sus cursos asignados del ciclo activo.
2. Llena `matriculados/aprobados/reprobados`.
3. Envía **pre-informe** (`isFinal: false`) o **final** (`isFinal: true`).
4. `CourseReport` guarda con `@@unique([courseId, cycleId, campusId, professorId, isFinal])`.

## Git workflow

- **Rama de trabajo: `develop`** — se pushea directo, Ángel despliega desde ahí.
- No crear PRs salvo que el usuario lo pida.
- Commits en español con prefijos: `feat(times):`, `fix(times):`, `refactor(times):`.
- **No commitear sin que Franko lo pida explícitamente.**

## Stack y convenciones

- **Runtime manager**: pnpm (workspaces + Turborepo).
- **Backend**: NestJS + Prisma + MongoDB, path aliases `@src/`, `@modules/`, `@core/`, `@common/`.
- **Frontend**: Next.js App Router, Zustand para estado, shadcn/ui + Tailwind, `fetch` vía services tipados.
- **Idioma**: código en inglés, comentarios/mensajes/UI en español (proyecto académico costarricense — UNA).
- **Testing**: Jest 29 en `apps/backend/test/`. Ver skill `gestion-calidad-testing` (slash command) para specs.

## Reglas de conducta al trabajar

1. **Antes de editar cualquier archivo fuera de los paths listados, preguntar.**
2. **Siempre leer el schema Prisma relevante antes de cambiar lógica de dominio.** La memoria puede estar desactualizada.
3. **Verificar estado real con `git log`/`git status`** antes de afirmar qué fases están hechas.
4. **No inventar nombres de modelos, campos o endpoints** — lee primero.
5. **Al terminar una tarea grande, actualizar la memoria de estado** (`memory/project_times_estado.md`) con fecha.
6. **Tiempo limitado**: queda poco semestre. Prioriza lo que desbloquea al profesor (FASE 6 operativa) sobre pulido estético.

## Documentación útil dentro del repo

- `apps/frontend/src/modules/times-management/README.md` — guía de uso de la UI.
- `apps/frontend/src/modules/times-management/REFACTORING.md` — historial de refactors.
- `packages/database/prisma/schema/DETAILED-TABLES-DOCUMENTATION.md` — tablas detalladas.
- `packages/database/prisma/schema/RELATIONSHIPS-DIAGRAM.md` — diagrama de relaciones.
- `packages/database/prisma/schema/DICCIONARIO-DATOS.tex` — diccionario para el TFM.

## Cuándo cargar skills complementarias

- Estado/pendientes → `times-status`
- Reunión/acuerdo con Erick → `times-erick`
- Nueva feature end-to-end (schema→backend→frontend) → `times-feature`
- Levantar dev, migraciones, seeds → `times-dev`
