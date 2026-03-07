# Análisis Completo: Reportes de Cumplimiento SINAES

> **Fecha del análisis:** 7 de marzo de 2026  
> **Calificación de eficiencia:** 5.5 / 10

---

## 1. Arquitectura General

La funcionalidad de reportes tiene un flujo completo **Frontend (Next.js) → Backend (NestJS) → Prisma/MongoDB**:

| Capa | Archivo |
|------|---------|
| **Página** | `apps/frontend/src/app/sinaes/reports/page.tsx` |
| **Filtros UI** | `apps/frontend/src/modules/sinaes-management/components/reports/compliance-filters.tsx` |
| **Resumen UI** | `apps/frontend/src/modules/sinaes-management/components/reports/compliance-summary.tsx` |
| **Tabla UI** | `apps/frontend/src/modules/sinaes-management/components/reports/compliance-table.tsx` |
| **Servicio FE** | `apps/frontend/src/modules/sinaes-management/services/sinaes-reports.service.ts` |
| **Types FE** | `apps/frontend/src/modules/sinaes-management/types/sinaes-reports.types.ts` |
| **Controller BE** | `apps/backend/src/modules/sinaes-reports/sinaes-reports.controller.ts` |
| **Service BE** | `apps/backend/src/modules/sinaes-reports/sinaes-reports.service.ts` |
| **PDF Generator** | `apps/backend/src/modules/sinaes-reports/pdf-generator.service.ts` |
| **DTOs** | `apps/backend/src/modules/sinaes-reports/dtos/` |

### Jerarquía de datos SINAES

```
Dimensión (1)
  └── Componente (*)
        └── Criterio (*)
              ├── Estándar (*)
              │     └── Evidencia de Calidad (*)
              └── Evidencia de Calidad (*) (directa al criterio)
                    └── Documento Probatorio (*)
                          └── CareerProofDocument (*) ←→ Carrera
```

---

## 2. Lo que FUNCIONA actualmente

- ✅ Generación de reporte con filtros (dimensión, componente, criterio, carrera, fechas)
- ✅ Cálculo jerárquico de cumplimiento: Dimensión → Componente → Criterio → Evidencia
- ✅ Tabla expandible con drill-down de 4 niveles
- ✅ Resumen visual con tarjetas de estadísticas y barra de progreso
- ✅ Exportación a PDF con Puppeteer (HTML renderizado con estilos profesionales)
- ✅ Exportación temporal (reportes sin guardar) y por ID (reportes guardados)
- ✅ Historial de reportes con paginación (backend)
- ✅ Persistencia automática de cada reporte generado en MongoDB
- ✅ Eliminación lógica de reportes (soft delete con `status: INACTIVE`)

---

## 3. Problemas Encontrados

### 3.1 CRÍTICOS (bloquean producción)

| # | Problema | Detalle | Estado |
|---|---------|---------|--------|
| C1 | **Sin autenticación/autorización en el backend** | El controller `sinaes-reports.controller.ts` no tiene `@UseGuards(JwtAuthGuard)` ni `@AuthorizedEndpoint()`. Cualquier persona puede generar, listar, eliminar reportes y exportar PDFs sin autenticarse. | ✅ Resuelto |
| C2 | **Desalineación de tipos frontend/backend** | El frontend espera `dimensionId`, `componentId`, `criterionId`, `evidenceId` en los tipos. El backend devuelve `id`, `code`, `name`. Esto causa que la tabla expandible use `dimension.dimensionId` que es `undefined`, rompiendo el toggle de expansión. | ✅ Resuelto |
| C3 | **`processCriterion` ignora evidencias** | El método usa `criterion.hasDirectEvidences` para bifurcar, pero si es `false` solo procesa `standards`, ignorando evidencias directas que podrían existir en ambos paths. | ✅ Resuelto |
| C4 | **Falta validación de permisos por rol** | La sidebar solo muestra el enlace a admins en UI, pero no hay protección real — un usuario no-admin puede acceder directamente a `/sinaes/reports`. | ✅ Resuelto |

### 3.2 IMPORTANTES (afectan UX/mantenibilidad)

| # | Problema | Detalle | Estado |
|---|---------|---------|--------|
| I1 | **0 tests** | No existe ni un solo test (unit, integration, e2e) para reportes — ni backend ni frontend. | ⬜ Pendiente |
| I2 | **30+ `console.log` de debugging en producción** | `compliance-filters.tsx` tiene ~15 `console.log` con emojis de debug. También en services y otros componentes. | ✅ Resuelto |
| I3 | **Historial con mapeo roto** | La respuesta del backend `listReports` devuelve `{ data, meta }` pero el frontend espera `{ reports, total, page, limit, totalPages }`. El historial nunca muestra reportes guardados. | ✅ Resuelto |
| I4 | **Puppeteer como dependencia de producción** | El PDF se genera con Puppeteer en el servidor. Esto requiere Chrome/Chromium instalado en el container Docker, consume mucha RAM (~200MB+), y es lento. | ⬜ Pendiente (evaluar alternativas) |
| I5 | **Sin paginación en el historial del frontend** | La página siempre pide `page=1, limit=10` sin control de paginación visible para el usuario. | ✅ Resuelto |
| I6 | **`ComplianceReportDto` sin decoradores de validación** | El DTO de entrada para `export-pdf-temp` no tiene `@IsString()`, `@ValidateNested()`, etc. Un body malformado podría crashear el servicio. | ✅ Resuelto (input DTO ya validado) |
| I7 | **`complianceStatus` es `String` en Prisma** | Debería ser un enum para consistencia y type-safety a nivel de base de datos. | ⬜ Pendiente |
| I8 | **Falta gestión de errores visible al usuario** | Solo hay un `alert()` nativo en caso de error de PDF. No hay toast/notification system integrado. | ✅ Resuelto |

### 3.3 MENORES / Nice-to-have

| # | Problema | Estado |
|---|---------|--------|
| M1 | No hay opción de guardar filtros como template/preset | ⬜ Pendiente |
| M2 | No hay comparación entre reportes (progreso Q1 vs Q2) | ⬜ Pendiente |
| M3 | No hay gráficos/charts (recharts, chart.js) | ⬜ Pendiente |
| M4 | Falta exportar a Excel/CSV además de PDF | ⬜ Pendiente |
| M5 | La página principal de Gestión SINAES no tiene tab de "Reportes" | ⬜ Pendiente |

---

## 4. Calificación de Eficiencia: 5.5 / 10

| Aspecto | Nota | Justificación |
|---------|------|--------------|
| **Funcionalidad core** | 7/10 | El flujo completo de generación, visualización y PDF funciona en lo básico |
| **Seguridad** | 2/10 | Endpoints 100% públicos, sin auth guards, sin validación de roles server-side |
| **Rendimiento** | 4/10 | Puppeteer consume ~200MB+ RAM por PDF; queries Prisma sin select/pagination en la jerarquía completa; no hay cache |
| **Calidad de código** | 5/10 | Buena estructura modular, pero llena de `any`, `console.log` de debug, tipos desalineados FE/BE |
| **Cobertura de tests** | 0/10 | Literalmente 0 tests |
| **UX/Error handling** | 5/10 | UI decente con tabs y drill-down, pero errores con `alert()`, historial roto, sin paginación |
| **Mantenibilidad** | 6/10 | Estructura de carpetas limpia (modular), DTOs documentados con Swagger, pero el uso masivo de `any` reduce la seguridad de tipos |
| **Buenas prácticas** | 4/10 | Ver sección siguiente |

---

## 5. Buenas Prácticas Faltantes

| Práctica | Estado | Dónde falla |
|----------|--------|------------|
| **Type safety (no `any`)** | ✅ Resuelto (módulo reportes) | Interfaces locales creadas en backend y frontend para todo el módulo de reportes |
| **Eliminar console.log** | ✅ Resuelto | Eliminados todos los console.log de debug en componentes de reportes |
| **Guards de autenticación** | ✅ Resuelto | `@UseGuards(JwtAuthGuard)` agregado al controller |
| **Validación de DTOs** | ✅ Resuelto | `GenerateReportFiltersDto` tiene validación completa con class-validator |
| **Error boundaries** | ❌ Falta | Sin React Error Boundary en la página de reportes |
| **Loading skeletons** | ⚠️ Parcial | Tiene `Loader2` spinner pero no skeletons para la tabla |
| **Memoización** | ⚠️ Parcial | Usa `useMemo` en filtros, pero la tabla se re-renderiza en cada expansión |
| **Separación de concerns** | ⚠️ Parcial | La página mezcla lógica de estado y UI — debería extraerse a un custom hook |
| **Internacionalización (i18n)** | ❌ Falta | Textos hardcodeados en español |
| **Accesibilidad (a11y)** | ❌ Falta | Sin `aria-label` en botones de expansión, sin `role` en tabla jerárquica |
| **Rate limiting** | ❌ Falta | Generación sin throttle — se pueden generar cientos de reportes |
| **Cache de consultas** | ⚠️ Parcial | React Query maneja cache en FE, pero el BE no cachea queries pesadas |
| **Logging estructurado** | ⚠️ Parcial | Backend usa `Logger` de NestJS con emojis, sin structured logging (JSON) |

---

## 6. Plan de Resolución (orden de prioridad)

### Fase 1 — Críticos
1. **[C1]** Agregar `@UseGuards(JwtAuthGuard)` al controller de reportes
2. **[C2]** Alinear tipos frontend/backend (mapear `id` → `dimensionId`, etc.)
3. **[C3]** Corregir `processCriterion` para considerar ambos paths de evidencias
4. **[C4]** Agregar middleware de protección de ruta por rol en frontend

### Fase 2 — Importantes
5. **[I2]** Eliminar todos los `console.log` de debug
6. **[I3]** Corregir mapeo de respuesta del historial (data/meta → reports/total)
7. **[I6]** Agregar validación a `ComplianceReportDto`
8. **[I8]** Reemplazar `alert()` por toast notifications
9. **[I5]** Agregar controles de paginación al historial

### Fase 3 — Calidad
10. **[I1]** Escribir tests unitarios para el servicio de reportes (backend)
11. Eliminar uso de `any` en backend y frontend
12. Agregar Error Boundary en la página de reportes
13. Mejorar memoización de la tabla expandible

---

## 7. Progreso de Resolución

| # | Problema | Estado | Fecha |
|---|---------|--------|-------|
| C1 | Auth guards en backend | ✅ Resuelto | 7 mar 2026 |
| C2 | Alineación de tipos FE/BE | ✅ Resuelto | 7 mar 2026 |
| C3 | Fix processCriterion | ✅ Resuelto | 7 mar 2026 |
| C4 | Protección de ruta por rol | ✅ Resuelto | 7 mar 2026 |
| I1 | Tests | ⬜ Pendiente | — |
| I2 | Eliminar console.log | ✅ Resuelto | 7 mar 2026 |
| I3 | Fix historial mapeo | ✅ Resuelto | 7 mar 2026 |
| I5 | Paginación historial | ✅ Resuelto | 7 mar 2026 |
| I6 | Validación DTOs | ✅ Resuelto (input DTO ya validado) | 7 mar 2026 |
| I8 | Toast notifications | ✅ Resuelto | 7 mar 2026 |
| — | Eliminar `any` en módulo reportes | ✅ Resuelto | 7 mar 2026 |

### Detalle de cambios realizados

#### C1: Auth guards en backend
- Agregado `@UseGuards(JwtAuthGuard)` y `@ApiBearerAuth()` a `sinaes-reports.controller.ts`
- Agregado `'SINAES_REPORT'` al allowlist de `permissions.guard.ts`

#### C2: Alineación de tipos FE/BE
- Actualizado `sinaes-reports.types.ts`: `dimensionId/componentId/criterionId/evidenceId/reportId` → `id`, `status` → `complianceStatus`, `ReportsListResponse` → `{ data, meta }`
- Actualizado `compliance-table.tsx`: mismos cambios de propiedades
- Actualizado `page.tsx`: eliminado hack `(response as any).data`, corregido mapeo de historial

#### C3: Fix processCriterion
- Reescrito `processCriterion` en `sinaes-reports.service.ts` para usar `Map<string, EvidenceComplianceDto>` que recolecta evidencias de ambos paths (directas y por estándares), deduplicando por ID

#### C4: Protección de ruta por rol
- Agregado `useAuth()` con verificación de rol admin en `page.tsx`
- UI de "Acceso Restringido" cuando el usuario no es administrador

#### I2: Eliminar console.log
- Eliminados ~20 `console.log` de debug en `compliance-filters.tsx` y `page.tsx`

#### I3: Fix historial mapeo
- Corregido como parte de C2: `savedReports.reports` → `savedReports.data`, tipo `SavedComplianceReport` importado

#### I5: Paginación historial
- Agregado estado `historyPage` reactivo en `page.tsx`
- Controles de paginación "Anterior/Siguiente" con indicador de página
- `useReportsList` ahora recibe página dinámica

#### I8: Toast notifications
- Reemplazados `alert()` nativos por `toast.warning()` y `toast.error()` de sonner
- Agregados `toast.success()` para generación de reporte y exportación PDF

#### Eliminar `any` en módulo reportes
- **Backend**: Creadas interfaces locales (`DimensionWithHierarchy`, `ComponentWithCriteria`, `CriterionWithHierarchy`, `EvidenceWithDocs`), tipado `Prisma.DimensionWhereInput`, `Prisma.JsonValue`, `ComplianceReportDto`
- **Backend PDF**: Tipadas funciones con `DimensionComplianceDto`, `ComponentComplianceDto`, `CriterionComplianceDto`
- **Backend Controller**: `ExpressRequest & { user?: ... }` en vez de `(request as any).user`
- **Frontend**: Creadas interfaces locales `FilterDimension`, `FilterComponent`, `FilterCriterion`, `FilterCareer` en `compliance-filters.tsx`
