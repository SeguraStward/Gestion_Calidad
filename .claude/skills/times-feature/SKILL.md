---
name: times-feature
description: Workflow end-to-end para implementar una feature nueva del módulo Tiempos (schema → backend → frontend). Úsala cuando el usuario pida "agregar", "implementar", "crear módulo/endpoint/página", "nueva funcionalidad" relacionada a cohortes, reportes, jornadas, portal profesor, asignaciones, etc.
---

# Workflow feature end-to-end — módulo Tiempos

Sigue este orden rígido. Saltarse pasos causa bugs de integración cuando el schema y el frontend se separan.

## 0. Antes de empezar

- [ ] Cargar contexto con skill `times-module-context` (si no está cargada).
- [ ] Verificar rama: debe ser `develop` (`git branch --show-current`).
- [ ] Leer schema relevante en `packages/database/prisma/schema/`.
- [ ] Si la feature vino de Erick: registrar con skill `times-erick`.

## 1. Schema Prisma (si hay cambios de datos)

Path: `packages/database/prisma/schema/<dominio>.prisma`

**Convenciones del proyecto (observadas en schemas existentes):**
```prisma
model <Nombre> {
  id      String @id @default(auto()) @map("_id") @db.ObjectId
  version Int    @default(0) @map("__v")

  // campos de dominio

  status <Enum>Status @default(ACTIVE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?  @db.ObjectId
  updatedBy String?  @db.ObjectId

  @@index([...])
  @@map("<snake_case_plural>")
}
```

**Reglas:**
- MongoDB (`@db.ObjectId`). Nunca uses `Int` para IDs.
- `__v` para version, como el resto del schema.
- Enums de status en archivo separado si son compartidos.
- `@@unique` para combinaciones naturales (ej. `[careerId, year, group]` en cohorts).
- Índices por cada FK y por campos de filtrado frecuente.

**Después de editar schema:**
```bash
cd c:/dev/Gestion_Calidad/packages/database && pnpm prisma generate
```
No correr `migrate` (MongoDB no usa migraciones tradicionales). Si hay data migration manual, proponer script en `packages/database/` y pedir confirmación a Franko antes de ejecutarlo contra datos reales.

## 2. Backend (NestJS)

Path: `apps/backend/src/modules/<nombre>/`

### Estructura mínima:
```
<nombre>/
  <nombre>.module.ts
  <nombre>.controller.ts     extiende GenericController<Entity>
  <nombre>.service.ts        extiende GenericService<Entity> (o custom)
  <nombre>.repository.ts     extiende GenericPrismaRepository<Entity>
  dtos/
    create-<nombre>.dto.ts
    update-<nombre>.dto.ts
```

### Reglas:
- **Lee un módulo existente similar antes de crear** (ej. `cohorts/` para CRUD simple, `professor-portal/` para guards custom).
- DTOs con `class-validator` (`@IsString`, `@IsInt`, `@IsMongoId`, etc).
- Controller usa `@ApiTags('<dominio>')` para Swagger.
- Registrar el módulo en `apps/backend/src/modules/index.ts` si existe, o en `app.module.ts`.
- Path aliases obligatorios: `@modules/`, `@core/`, `@common/`, `@src/`.

### Lógica custom (no CRUD genérico)
Cuando la lógica excede CRUD (cálculos, validaciones cruzadas, agregaciones):
- Sobrescribir métodos del `GenericService` en el service custom.
- Lógica de negocio SIEMPRE en service, nunca en controller.
- Transacciones Prisma con `$transaction` cuando afectes múltiples entidades.

### Tests
Ver skill `gestion-calidad-testing` (slash command). Mínimo un spec por service custom.

## 3. Frontend (Next.js + Zustand)

### 3.1 Service (HTTP tipado)
Path: `apps/frontend/src/modules/times-management/services/<nombre>.service.ts`

```typescript
// Usa el patrón de services existentes en la carpeta como referencia
// (cohorts.service.ts, course-reports.service.ts, etc.)
```

### 3.2 Store Zustand
Path: `apps/frontend/src/modules/times-management/store/use<Nombre>Store.ts`

Sigue el patrón de `useCohortsStore.ts`. Mantén:
- `items`, `loading`, `error`, `selectedItem`.
- Acciones: `fetch`, `create`, `update`, `delete`, `selectItem`.
- Sin persistencia (localStorage) salvo que sea crítico.

### 3.3 Componentes
Path: `apps/frontend/src/modules/times-management/components/<Pascal>.tsx`

- Componentes **tontos** (props-driven), la lógica vive en la página.
- Usar `@/components/ui/*` (shadcn) para primitivos.
- Textos en español.

### 3.4 Página
Path: `apps/frontend/src/modules/times-management/pages/<nombre>.tsx`

Compone store + componentes. Una página por ruta.

### 3.5 Ruta Next.js
Path: `apps/frontend/src/app/times-management/<subruta>/page.tsx`

```tsx
"use client";
import { <Nombre>Page } from "@/modules/times-management/pages/<nombre>";
export default function Page() { return <<Nombre>Page />; }
```

### 3.6 Sidebar (si la feature es navegable)
Actualizar `apps/frontend/src/app/(components)/ui/app-sidebar.tsx` para que aparezca bajo "Gestión de Tiempos de Jornada".

## 4. Verificación

Antes de dar por terminada la feature:

- [ ] `pnpm --filter backend build` sin errores TS.
- [ ] `pnpm --filter frontend build` sin errores TS.
- [ ] Levantar dev y probar flujo real en el navegador (ver skill `times-dev`).
- [ ] Caso golden path + al menos 1 edge case manualmente.
- [ ] Confirmar que no rompe tabs/rutas existentes de times-management.
- [ ] Si afecta al portal profesor, probar con cédula+token real de prueba.

## 5. Cierre

- [ ] Actualizar `memory/project_times_estado.md` con lo entregado y fecha.
- [ ] Si afecta el alcance pactado con Erick, registrar en `memory/erick_meetings.md`.
- [ ] Commit con prefijo `feat(times):`, `fix(times):` según corresponda. Solo commitear si el usuario lo pide.

## Atajos y shortcuts PROHIBIDOS

- ❌ No crear entidades con IDs `String` sin `@db.ObjectId`.
- ❌ No mezclar lógica de autenticación del portal profesor con JWT normal.
- ❌ No añadir feature flags ni backwards-compat — borra y reemplaza.
- ❌ No dejar datos mock en producción (lección de FASE 1: eliminar 659 líneas mock).
- ❌ No crear páginas sueltas sin registrarlas en sidebar (salvo portal-profesor que es intencionalmente público).
