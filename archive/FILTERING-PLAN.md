# Plan de Implementación: Filtrado Efectivo

## Diagnóstico — Por qué no funciona el filtrado

### Problema raíz: la búsqueda es client-side sobre una sola página

```
DataTable (search input)
    ↓ filtrado en memoria sobre los 10 items de la página actual
    ✗ NUNCA envía el término al backend
```

`CrudModuleBase` le pasa `queryParams = { page, limit }` al hook de query. El `DataTable`
tiene soporte para `serverSideFiltering` pero **nunca se le activa**. El backend ya tiene
endpoint `?search=` en `academic-loads` y `users`, pero el frontend nunca lo invoca.

**Problemas adicionales:**
- `usePagination` no lleva `search` ni filtros extra en `queryParams`
- No existen dropdowns de filtro (por ciclo, por curso, por estado, etc.)
- Los controllers de `courses` y `academic-cycles` no tienen endpoint `?search=`

---

## Fase 1 — Conectar el search box al backend (todos los módulos)

**Estado:** en progreso

### Archivos a modificar

#### `apps/frontend/src/shared/hooks/usePagination.ts`
Agregar `search`, `filters`, `updateSearch`, `updateFilters` al hook.
Incluirlos en `queryParams` para que lleguen al API.
Resetear a página 1 al cambiar cualquier filtro.

#### `apps/frontend/src/app/(components)/crud/crud-module-base.tsx`
Destructurar `search` y `updateSearch` de `usePagination`.
Pasar `serverSideFiltering={true}`, `searchQuery={search}` y `onSearchChange={updateSearch}` al `DataTable`.

#### `apps/backend/src/modules/courses/courses.controller.ts`
Override del `findAll` para aceptar `?search=` y filtrar por `code` y `name`.

#### `apps/backend/src/modules/academic-cycles/academic-cycles.controller.ts`
Override del `findAll` para aceptar `?search=` y filtrar por `name` y `code`.

---

## Fase 2 — Filtros por atributos (dropdowns por módulo)

**Estado:** pendiente

### Nueva prop en `CrudModuleBase`: `filterConfig`

```ts
type FilterField = {
  key: string            // nombre del query param → ?academicCycleId=xxx
  label: string          // "Ciclo Académico"
  type: 'select' | 'text'
  options?: { id: string; name: string }[]
  isLoading?: boolean
}
```

### Nuevo componente `FilterBar`
Ubicación: `apps/frontend/src/app/(components)/crud/filter-bar.tsx`
Se renderiza encima del DataTable. Emite cambios via `updateFilters`.

### Configuración de filtros por módulo

| Módulo             | Filtros                                  |
|--------------------|------------------------------------------|
| Cargas Académicas  | Ciclo (select), Curso (select), Estado (select) |
| Cursos             | Estado (select)                          |
| Ciclos Académicos  | Año (input number)                       |
| Profesores/Usuarios| Estado (select), Rol (select)            |

### Archivos a crear/modificar
- `apps/frontend/src/app/(components)/crud/filter-bar.tsx` ← nuevo
- `apps/frontend/src/app/(components)/crud/crud-module-base.tsx` ← agregar `filterConfig` prop + `FilterBar`
- `apps/frontend/src/modules/academic-management/academic-load/components/academic-load-page.tsx` ← pasar `filterConfig`
- `apps/frontend/src/modules/academic-management/academic-maintenance/components/cruds/courses.tsx` ← pasar `filterConfig`

---

## Fase 3 — Filtros directos por ID en academic-loads (backend)

**Estado:** pendiente

### `apps/backend/src/modules/academic-loads/academic-loads.controller.ts`
Ampliar el `findAll` existente para aceptar filtros adicionales:
- `?academicCycleId=` → filtra por ciclo
- `?courseId=` → filtra por curso
- `?professorId=` → filtra por profesor
- `?status=` → filtra por estado

---

## Orden de implementación

```
Fase 1:
  1. usePagination.ts                     ✅ / ⏳
  2. crud-module-base.tsx                 ✅ / ⏳
  3. courses.controller.ts               ✅ / ⏳
  4. academic-cycles.controller.ts       ✅ / ⏳

Fase 2:
  5. filter-bar.tsx (nuevo)
  6. crud-module-base.tsx (filterConfig + FilterBar)
  7. academic-loads.controller.ts (filtros por ID)
  8. academic-load-page.tsx (filterConfig)
  9. courses.tsx (filterConfig)
```
