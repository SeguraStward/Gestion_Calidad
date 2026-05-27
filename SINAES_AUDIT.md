# Auditoría Exhaustiva — Módulo SINAES

> **Fecha:** 2026-05-16
> **Alcance:** `apps/frontend/src/app/sinaes-management/`, `apps/frontend/src/modules/sinaes-management/`, `apps/backend/src/modules/google-drive/`, `apps/backend/src/modules/google-drive-folders/`
> **Objetivo:** Inventariar inconsistencias, bugs y errores de funcionalidad antes de aplicar mejoras.

---

## 1. Propósito del módulo

Sistema de gestión documental para acreditación SINAES (Sistema Nacional de Acreditación de la Educación Superior — UNA, Costa Rica). Implementa una jerarquía de 5 niveles: **Dimensiones → Componentes → Criterios → Estándares/Evidencias Directas → Evidencias de Calidad**. Permite:

- Crear/mantener la estructura jerárquica de acreditación.
- Subir documentos probatorios a Google Drive (sincronizados con la DB vía OAuth2).
- Consultar/buscar documentos con filtros y paginación.
- Historial de cambios y reportes de cumplimiento de criterios por carrera.

---

## 2. Arquitectura observada

```
Frontend (Next.js + React + Zustand + React Query)
  apps/frontend/src/app/sinaes-management/page.tsx           ← entry point
  apps/frontend/src/modules/sinaes-management/
    ├── components/{upload, structure, query, document-types, forms, history, reports, admin}
    ├── pages/sinaes-admin.tsx
    ├── services/   (HttpClient → backend REST)
    ├── store/      (sinaes-navigation, document-assignment)
    ├── hooks/      (use-auto-numbering)
    ├── types/      (interfaces TS)
    └── utils/      (code-utils, validation-utils)

Backend (NestJS + Prisma + googleapis)
  apps/backend/src/modules/google-drive/
    ├── google-drive.service.ts          ← OAuth2Client + estructura de carpetas + uploads
    ├── google-drive.controller.ts
    ├── drive-sync-checker.service.ts    ← STUB (no verifica realmente)
    └── google-drive.module.ts
  apps/backend/src/modules/google-drive-folders/
    ├── google-drive-folders.{service,controller,repository,module}.ts
    └── dtos/{create,update,google-drive-folder}.dto.ts

Flujos clave:
  Upload   : Frontend → POST /proof-documents/upload → Drive API + DB (transacción)
  Consulta : Frontend → GET /proof-documents/search  → JSON paginado con jerarquía
  Sync     : Cron / endpoint → drive-sync-checker (stub)
```

---

## 3. Inconsistencias críticas (rompen funcionalidad)

### 3.1 ⚠️ CRÍTICO — Duplicación de `upload-documents-tab.tsx`
- `apps/frontend/src/modules/sinaes-management/components/upload-documents-tab.tsx` (47 líneas, **lógica real** con `proofDocumentUploadService`)
- `apps/frontend/src/modules/sinaes-management/components/upload/upload-documents-tab.tsx` (165 líneas, contiene `// TODO: Implementar la lógica de subida` y `alert()`)
- En `components/sinaes-management-page.tsx:6` el import `./upload-documents-tab` es ambiguo según el resolver.
- **Impacto:** según cómo TS resuelva, podría montarse la versión stub y el usuario "sube" sin que pase nada.
- **Fix:** eliminar el archivo raíz, mantener solo `components/upload/upload-documents-tab.tsx` (versión funcional) y actualizar el import.

### 3.2 Duplicación de `proof-document-type-form.tsx`
- `components/forms/proof-document-type-form.tsx` (archivo **vacío**, 1 línea).
- `components/document-types/proof-document-type-form.tsx` (268 líneas, lógica real).
- **Fix:** eliminar el archivo vacío en `forms/`.

### 3.3 Componentes debug en bundle de producción
- `components/scroll-debug.tsx` — `<div>` rojo con `position: fixed; z-index: 9999`.
- `components/config-debug.tsx` — hace `fetch` a `/api/v1/auth/me` y loguea en consola si el usuario tiene `googleAccessToken`.
- **Fix:** eliminarlos o aislarlos bajo `if (process.env.NODE_ENV === 'development')` y carpeta `/debug` no importada.

### 3.4 Código muerto en `components/admin/`
- `auto-numbering-test-suite.tsx`, `recalculate-codes-admin.tsx`, `admin/index.ts` — exportados pero **nunca importados** desde `sinaes-management-page.tsx` ni otras tabs.
- **Fix:** decidir si exponer una tab Admin o eliminar.

### 3.5 Respuesta de upload sin validación estructural
- `services/proof-document-upload.service.ts:99-109`:
  ```ts
  const actualData = response.data?.data || response.data
  ```
  Fallback frágil. Si el backend responde `{ error: "...", proofDocument: null }`, no lanza excepción y rompe downstream.
- **Fix:** validar `actualData?.proofDocument` antes de retornar; lanzar `Error('Invalid response structure')`.

---

## 4. Errores de manejo de errores / edge cases

### 4.1 ⚠️ `DriveSyncCheckerService.verifyAllDocuments()` es un stub
- `backend/src/modules/google-drive/drive-sync-checker.service.ts:69-74`:
  ```ts
  // TODO: Implement actual Drive verification
  // For now, just log what would be checked
  this.logger.debug(`Would verify: ${doc.code} ...`);
  verified++;
  ```
- **Siempre** retorna `verified=total, missing=0`. La UI de sync miente al admin.
- Además accede a método privado `this.googleDriveService['createDriveClient'](...)` (l. 187) para evadir el type-checker.

### 4.2 Catch silencioso en creación de `_carreras.txt`
- `google-drive.service.ts:453-456`: si falla la creación del archivo de metadata, sólo se loguea. El documento queda inconsistente (subido pero sin `_carreras.txt`).
- **Fix:** retornar estado parcial o reintentos con backoff.

### 4.3 Null/undefined no manejados en tabla
- `components/query/proof-documents-table.tsx:122` renderiza `${document.evidence?.code} - ${document.evidence?.name}` → `"undefined - undefined"` si `evidence` es null.
- **Fix:** condicional explícito con fallback "Sin evidencia".

### 4.4 Race condition en hook de upload
- `services/proof-document-upload.service.ts:124-174`: sin `AbortController`. Si el componente se desmonta antes de resolver, hay warnings de state update en componente desmontado.

---

## 5. Inconsistencias de tipado / DTOs / contratos API

### 5.1 `fileSize` opcional vs requerido
- `types/proof-documents.types.ts:4-67` → `fileSize: number` (requerido).
- `services/proof-documents.service.ts:16` → `fileSize?: number` (opcional).
- En `proof-documents-table.tsx:134` `formatFileSize` devuelve `'N/A'` sin distinguir "no cargó" vs "no hay tamaño".
- **Fix:** unificar — preferiblemente requerido y siempre poblado por backend.

### 5.2 `GoogleDriveFolderDto` con casting `as any`
- `dtos/google-drive-folder.dto.ts:8-80`: campos `id?`, `parentFolderId?` opcionales.
- `google-drive.service.ts:290-297` invoca `save({...} as any)` — señal de mismatch real.
- **Fix:** alinear DTO con la entrada real o usar tipos derivados.

### 5.3 `meta.limit` ignorado en paginación
- `components/query/query-documents-tab.tsx:88-94`: `const limit = 5` hardcoded; debería ser `data?.meta?.limit ?? 5`. Causa cálculo erróneo de `startItem` si el backend usa otro límite.

### 5.4 Campo `meta.hasPrev` definido pero nunca consumido
- `types/proof-documents.types.ts:87-97` — código muerto en el tipo.

---

## 6. Duplicación / código muerto

| Archivo | Estado | Acción |
|---|---|---|
| `components/upload-documents-tab.tsx` | duplicado funcional vs stub | **Eliminar raíz** |
| `components/forms/proof-document-type-form.tsx` | vacío | Eliminar |
| `components/scroll-debug.tsx` | nunca usado, visual disruptivo | Eliminar |
| `components/config-debug.tsx` | nunca usado, loguea auth state | Eliminar |
| `components/admin/*` | exportado, nunca importado | Decidir tab Admin o eliminar |
| `components/google-auth-banner.tsx` | `return null` + JSX muerto debajo | Eliminar o implementar |
| `hooks/use-auto-numbering.ts::recalculateAllCodes` | exportado, sin consumidor | Conectar con admin tab o eliminar |

---

## 7. Problemas de seguridad

### 7.1 Detección frágil de token expirado
- `google-drive.service.ts:261-267` valida por substring (`'invalid_grant'`, `'Token'`). Si Google cambia el wording, deja de funcionar.
- **Fix:** comparar `error.code` / `error.response?.status === 401`.

### 7.2 Sin refresh automático de OAuth
- `google-drive.service.ts:54-65`: setea credenciales pero no maneja `oauth2Client.refreshAccessToken()` en el catch. Cada expiración fuerza re-login manual.

### 7.3 Logs que exponen estado de autenticación
- `components/config-debug.tsx`: imprime `'Has Google Token? YES/NO'` y `NEXT_PUBLIC_API_URL` en consola del navegador.

### 7.4 Sobrescritura ciega de `_carreras.txt`
- `google-drive.service.ts:420-431`: si hay múltiples archivos con el mismo nombre en Drive, actualiza el primero sin validar `parents`. Riesgo de mutar archivo equivocado.

---

## 8. Problemas de UX/UI inconsistentes

- **Mensajes de error**: `proof-document-upload.service.ts:150-171` da descripciones detalladas; `edit-document-dialog.tsx:112` usa `toast.error(errorMessage)` genérico.
- **Loading states**: skeletons en `document-types-tab.tsx:138-145`, spinner texto en `proof-documents-table.tsx:61-70`, spinner mudo en `simple-proof-document-form.tsx:78-87`. No hay estándar.
- **`replace-file-dialog.tsx:174`**: botón disabled durante mutation pero sin spinner — el usuario no sabe si está procesando.
- **`edit-document-dialog.tsx:318`**: botón se deshabilita si no hay carreras seleccionadas pero sin tooltip explicativo.

---

## 9. Problemas de performance

### 9.1 N+1 en expansión del árbol
- `components/structure/sinaes-structure-tab.tsx:614-618`: cada nivel hace su propia query con `enabled: expanded`. Expandir 5 niveles = 5 fetches en cascada; expandir 10 dimensiones puede disparar 10+ requests en waterfall.
- **Fix:** endpoint con `include` anidado, o prefetch con React Query.

### 9.2 Doble render en `toggleEvidence`
- `store/document-assignment.store.ts:65-73`: llama `addEvidence`/`removeEvidence` que a su vez ejecutan `set()`. Dos renders por toggle.
- **Fix:** hacerlo atómico con un único `set((state) => ...)`.

### 9.3 Sin virtualización en selector de carreras
- `components/query/edit-document-dialog.tsx:57-65`: `params: { limit: 1000 }` hardcoded, renderiza todo en `<ScrollArea>`. Lag con catálogos grandes.
- **Fix:** virtual scroll (TanStack Virtual / react-window) o búsqueda paginada.

---

## 10. Inconsistencias de naming / convenciones

- **Idioma mezclado:** entidades en inglés (`ProofDocument`, `QualityEvidence`) y dominios en español (`dimensión`, `criterio`, "Documento Probatorio") sin guía clara.
- **camelCase vs snake_case en payloads:** `proof-document-upload.service.ts:85` envía `careerIds` por FormData; verificar que el backend no espere `career_ids`.
- **Prefijos de hooks/servicios:** `useProofDocuments` vs `useQualityEvidences` (plural), `proofDocumentService` (singular). Definir convención.

---

## 11. Problemas con Google Drive Sync

### 11.1 `drive-sync-checker.service.ts` es un stub
- Ya descrito en **4.1**. Riesgo más alto del módulo: la UI puede reportar todo "OK" sin haber verificado nada.

### 11.2 Tokens expirados no se refrescan automáticamente
- `google-drive.service.ts:54-65`. Re-login forzado en cada expiración.

### 11.3 Jerarquía de carpetas no se persiste
- `google-drive.service.ts:169-178` siempre escribe `parentFolderId: null`. La estructura en DB queda **plana** mientras que Drive sí mantiene árbol → imposible reconstruir relaciones desde la DB.
- **Fix:** propagar `parentFolderId` nivel a nivel.

### 11.4 Búsqueda de `_carreras.txt` sin filtro de `parents`
- `google-drive.service.ts:420-431`: el listado existente no restringe al folder objetivo. Si hay colisión de nombre, actualiza el archivo incorrecto.

---

## 12. Recomendaciones de refactor priorizadas

### Alta (crítico antes de producción)
1. **Eliminar duplicado `upload-documents-tab.tsx`** y fijar import (sec. 3.1). _~5 min._
2. **Implementar real `DriveSyncCheckerService`** o marcarlo `Not Implemented` y ocultar del UI (sec. 4.1 / 11.1). _~3 h._
3. **Validar respuesta de upload** antes de retornar (sec. 3.5). _~30 min._
4. **Eliminar `scroll-debug.tsx` y `config-debug.tsx`** del bundle (sec. 3.3 / 7.3). _~10 min._
5. **Refresh automático de OAuth** + detección por código de error, no por string (sec. 7.1 / 7.2 / 11.2). _~2 h._
6. **Persistir `parentFolderId`** y restaurar jerarquía de carpetas (sec. 11.3). _~3 h._

### Media (confiabilidad)
7. Resolver N+1 en árbol de estructura (sec. 9.1).
8. Unificar manejo de errores y loading states (sec. 8).
9. Eliminar duplicado `forms/proof-document-type-form.tsx` (sec. 3.2).
10. Filtrar por `parents` al actualizar `_carreras.txt` (sec. 11.4).
11. Alinear tipos `fileSize`, `meta.limit`, DTO de folders (sec. 5).

### Baja (limpieza)
12. Borrar `google-auth-banner.tsx`, `admin/*` no usados, `meta.hasPrev` (sec. 6).
13. Virtualizar selector de carreras (sec. 9.3).
14. Convención de naming (idioma, casing) (sec. 10).
15. Tests unitarios para edge cases (upload inválido, token expirado).

---

## Resumen ejecutivo

El módulo SINAES está **funcional en la ruta feliz**, pero presenta riesgos serios:

- ❌ **Duplicación de `upload-documents-tab.tsx`** con una versión stub que puede montarse silenciosamente.
- ❌ **`DriveSyncCheckerService` no verifica**; reporta éxito siempre.
- ❌ **OAuth sin refresh**: cualquier expiración fuerza re-login.
- ❌ **Jerarquía de folders perdida en DB** (`parentFolderId` siempre `null`).
- ⚠️ Componentes debug aún en el bundle.
- ⚠️ N+1 queries en navegación del árbol y manejo inconsistente de errores/loading.

**Acción recomendada inmediata:** ejecutar los 6 items de prioridad Alta (≈ 8–9 h de trabajo) antes de cualquier nueva feature.
