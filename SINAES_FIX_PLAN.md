# Plan de Correcciones SINAES — Paso a Paso

> **Fecha:** 2026-05-16
> **Origen:** Observaciones en sesión + auditoría previa ([SINAES_AUDIT.md](SINAES_AUDIT.md)).
> **Estrategia:** Empezamos por *quick wins* (alto impacto / bajo riesgo), luego refactor de uploads (cambio arquitectónico), luego reportes centrados en carrera.

---

## Análisis de la sección de reportes (lo que existe hoy)

**Backend** — `apps/backend/src/modules/sinaes-reports/sinaes-reports.service.ts`
- Genera reportes jerárquicos Dimensión → Componente → Criterio → Estándar → Evidencia.
- Calcula `compliancePercentage` por nivel como `evidencesWithDocuments / totalEvidences`.
- Filtros disponibles: `dimensionId`, `componentId`, `criterionId`, `careerId` (UNA carrera), rango de fechas.
- Guarda el reporte en `SinaesComplianceReport` y permite exportar a PDF.

**Frontend** — `apps/frontend/src/app/sinaes/reports/page.tsx` + `components/reports/`
- `ComplianceSummary`: tarjetas de KPIs globales (total evidencias, con docs, faltantes, % cumplimiento general).
- `ComplianceTable`: árbol expandible Dim → Comp → Crit → Evidencia, con conteos y badges.
- `ComplianceFilters`: selectores de dimensión/componente/criterio + **una sola carrera**.

### Lo que **falta** (lo que el usuario pidió)

El reporte actual responde a *"¿qué evidencias tienen documentos?"*, pero **no responde** a:

1. **Para cada carrera, ¿cuántos documentos probatorios tiene subidos y en qué ubicaciones de la jerarquía SINAES están?** No es un "% de cumplimiento" — es un **inventario por carrera**.
2. **Drill-down por carrera:** poder navegar Dimensión → Componente → Criterio → Estándar → Evidencia y ver los documentos asociados a esa carrera (o la ausencia).
3. El filtro actual `careerId` es singular — si lo dejas vacío muestra todo global; si lo llenas, muestra UNA carrera. Falta poder ver **todas las carreras en simultáneo** con su inventario.

### Métrica clave (decidida)

> **No usamos umbral ni semáforo verde/amarillo/rojo.** Solo *contamos*.

Para cada par `(carrera, ubicación-de-jerarquía)`:
- `documentCount` = cantidad de `proofDocument` activos asociados a esa carrera (`careerProofDocuments`) en esa ubicación.

Agregaciones derivadas:
- Total de documentos por carrera (suma global).
- Documentos por carrera × dimensión / componente / criterio / estándar / evidencia (para el drill-down).
- Listado de ubicaciones donde la carrera **tiene 0 documentos** (las "brechas" — sin etiquetas de "incumplimiento", solo el dato crudo).

---

## Fases del plan

### FASE 1 — Quick wins (≈ 2 h, riesgo bajo)
Resuelven los bugs visibles más molestos sin tocar arquitectura.

#### 1.1 Toasts duplicados ✂️
- **Archivo:** [apps/frontend/src/modules/sinaes-management/components/structure/sinaes-structure-tab.tsx](apps/frontend/src/modules/sinaes-management/components/structure/sinaes-structure-tab.tsx)
- **Acción:** eliminar los `toast.success/error` manuales (líneas 269, 271, 450, 452, 468, 470, 585, 587, 709, 711, 820, 822).
- **Por qué:** `createGenericHooks` (en `apps/frontend/src/services/base/generic.hooks.ts`) ya dispara `toast` automáticamente. La duplicación viene del double-firing.
- **Verificación:** customizar los mensajes vía la opción `messages: { deleted: () => 'Dimensión eliminada' }` cuando se crea cada hook.

#### 1.2 Mensaje de error accionable al eliminar Dimensión con hijos 📛
- **Archivo backend:** [apps/backend/src/modules/dimensions/dimensions.service.ts](apps/backend/src/modules/dimensions/dimensions.service.ts)
- **Acción:** override `checkActiveRelations` para devolver mensaje con el nombre de la entidad y conteo de hijos: `"No se puede eliminar la dimensión '${name}' porque tiene ${N} componente(s) activos. Elimina o desactiva los componentes primero."`.
- **Replicar** en `components.service.ts`, `criteria.service.ts`, `standards.service.ts`, `quality-evidences.service.ts` con sus respectivos hijos.
- **Frontend:** en lugar de `toast.error`, mostrar `AlertDialog` cuando el error venga con código 400 y `message` específico — el usuario lo lee con calma.
- **Archivos frontend:** los `ConfirmDelete` de `sinaes-structure-tab.tsx` deben capturar el error y abrir un `AlertDialog` con el mensaje del backend.

#### 1.3 Carreras completas en upload 🎓
- **Diagnóstico previo:** ejecutar `SELECT COUNT(*) FROM careers WHERE status='ACTIVE';` para conocer el universo.
- **Archivos:**
  - [apps/frontend/src/modules/sinaes-management/components/upload/simple-proof-document-form.tsx:46](apps/frontend/src/modules/sinaes-management/components/upload/simple-proof-document-form.tsx#L46) — no pasa `limit`, toma default.
  - [apps/frontend/src/modules/sinaes-management/components/upload/career-selector.tsx:24-25](apps/frontend/src/modules/sinaes-management/components/upload/career-selector.tsx#L24-L25) — `limit: 1000`.
- **Acción:**
  1. Cambiar ambas queries a usar `useListCareersFlat()` (ya existe y funciona bien, lo usa `ComplianceFilters`).
  2. Filtrar por `status === 'ACTIVE'` en frontend.
  3. Mostrar contador *"Mostrando X de Y carreras activas"* en la UI del selector.
- **Si hay > 200 carreras:** agregar caja de búsqueda local para no hacer scroll infinito.

---

### FASE 2 — Refactor de uploads y estructura en Drive (≈ 8–12 h, riesgo medio-alto)
Resuelve los puntos 6, 7 y 8 del usuario.

#### 2.1 Cambio arquitectónico: agrupación por tipo + carpeta por subida

**Estructura nueva en Google Drive (decidida):**

```
SINAES - Gestión de Calidad/
└── 1. Docencia/
    └── 1.1 Plan de estudios/
        └── 1.1.1 Pertinencia.../
            └── 1.1.1.A Estándar.../
                └── EV-001 Convenios/
                    ├── Convenio/                       ← agrupador por tipo
                    │   ├── CONV-001/                   ← carpeta por subida
                    │   │   ├── CONV-001_archivo.pdf
                    │   │   └── CONV-001_carreras.txt
                    │   └── CONV-002/
                    │       ├── CONV-002_archivo1.pdf
                    │       ├── CONV-002_archivo2.docx  ← multi-archivo
                    │       └── CONV-002_carreras.txt
                    ├── Acta/
                    │   └── ACT-005/
                    │       ├── archivo.pdf
                    │       └── ACT-005_carreras.txt
                    └── Informe/
                        └── INF-003/...
```

**Reglas:**
- Dentro de la carpeta de evidencia hay **un sub-folder por cada tipo de documento probatorio** (nombre = `proofDocumentType.name`, ej. `Convenio`, `Acta`, `Informe`).
- Dentro de cada tipo, hay **una carpeta por subida** nombrada con el `code` del documento (ej. `CONV-001/`).
- La carpeta de la subida contiene los archivos + su `_carreras.txt`.
- **Re-subir el mismo `code`** → agregar archivos a esa misma carpeta + regenerar `_carreras.txt` desde DB (unión de carreras).
- Múltiples subidas del mismo tipo → múltiples subcarpetas hermanas dentro del agrupador.

#### 2.2 Schema Prisma — Agregar `googleDriveUploadFolderId` y `googleDriveTypeFolderId`

- **Archivo:** `packages/database/prisma/schema.prisma`
- **Cambio:** agregar a `ProofDocument`:
  ```prisma
  googleDriveTypeFolderId   String?  // carpeta del tipo (Convenio/, Acta/...)
  googleDriveUploadFolderId String?  // carpeta de la subida (CONV-001/)
  ```
- **Migración:** `pnpm prisma migrate dev --name add-upload-folder-ids`.
- **Sin destrucción de datos:** los campos son **nullable** y se agregan sin alterar columnas existentes. Documentos viejos conservan `null` y siguen funcionando con la lógica de fallback (lectura desde `googleDriveFolderId`, que sigue existiendo).
- **Backfill:** **no haremos backfill** según tu decisión. Documentos legacy quedan planos en la carpeta de evidencia; sólo las subidas nuevas usan la estructura nueva.

#### 2.3 Backend — `createFolderStructure` agrega dos niveles más

- **Archivo:** [apps/backend/src/modules/google-drive/google-drive.service.ts](apps/backend/src/modules/google-drive/google-drive.service.ts)
- **Acción:**
  1. Después de crear la carpeta de evidencia, crear/obtener `{proofDocumentType.name}/` (idempotente — si ya existe, reusar). Guardar su id como `googleDriveTypeFolderId`.
  2. Adentro, crear `{documentCode}/` (ej. `CONV-001/`). Guardar como `googleDriveUploadFolderId`.
  3. Retornar `DriveFolder` con `id` = carpeta de la subida.
  4. Guardar metadata en DB:
     - `level: 6, entityType: 'documentType'` para la del tipo.
     - `level: 7, entityType: 'upload'` para la de la subida.
- **Nota:** el nombre del tipo debe sanitizarse para evitar caracteres prohibidos en Drive (`/`, `\`, etc.).

#### 2.4 Backend — `uploadFile` ya no falla por "ya existe"

- **Quitar** el check de "archivo con mismo nombre en folder" (líneas 351-358 actuales).
- **Razón:** ahora cada subida tiene su propia carpeta — no hay colisión natural.
- **Reemplazo:** si el cliente intenta subir un archivo con el mismo `originalname` *dentro de la misma subida*, sí marcar duplicado.

#### 2.5 Backend — Lógica de "merge careers" en re-upload del mismo code

- **Endpoint nuevo:** `PATCH /proof-documents/:id/append-careers` que recibe `careerIds: string[]` y los agrega a los existentes (unión, no reemplazo).
- **Endpoint actual:** `POST /proof-documents/:id/careers` (replace) → mantener pero renombrar conceptualmente.
- **Trigger automático:** cuando el frontend detecta que está re-subiendo a un código existente, llamar `append-careers` + regenerar `_carreras.txt` desde DB.

#### 2.6 Backend — DB como fuente de verdad de `_carreras.txt`

- **Archivo:** `google-drive.service.ts`
- **Cambio en `createCarrerasFile`:** ya no recibe `careerNames: string[]` directamente. En su lugar, recibe `proofDocumentId` y consulta `careerProofDocuments` en DB para construir la lista.
- **Beneficio:** si alguien edita carreras desde el admin, el archivo se regenera; nunca queda desincronizado.

#### 2.7 Backend — Generación atómica de códigos (`CONV-001` → `CONV-002`)

- **Archivo:** [apps/backend/src/modules/sinaes-management/services/auto-numbering.service.ts](apps/backend/src/modules/sinaes-management/services/auto-numbering.service.ts) (verificar ruta exacta).
- **Problema actual:** al subir dos docs al mismo tiempo, ambos leen el contador y escriben `CONV-001` y `CONV-001` (race condition).
- **Solución:** envolver la generación + creación del `proofDocument` en una transacción Prisma con `$transaction` + `SELECT ... FOR UPDATE` sobre la tabla del tipo de documento.
  ```ts
  await prisma.$transaction(async (tx) => {
    const lastDoc = await tx.proofDocument.findFirst({
      where: { proofDocumentTypeId },
      orderBy: { code: 'desc' },
    });
    const nextCode = computeNext(lastDoc?.code);
    return tx.proofDocument.create({ data: { code: nextCode, ... } });
  }, { isolationLevel: 'Serializable' });
  ```
- **Alternativa robusta:** secuencias nativas de Postgres por prefijo.

#### 2.8 Backend — Mutex en `ensureFolderWithClient`

- **Problema:** dos requests concurrentes pueden buscar la carpeta, no encontrarla, y crear duplicados en Drive.
- **Solución simple in-process:** `Map<string, Promise<string>>` indexado por `${parentId}/${folderName}`. Si ya hay una promesa en curso para esa combinación, esperarla.
- **Riesgo:** solo protege contra concurrencia del mismo proceso Node. En multi-instance habría que usar Redis. Para esta etapa, basta el mutex local.

#### 2.9 Frontend — Soporte multi-archivo en una sola subida

- **Archivo:** [apps/frontend/src/modules/sinaes-management/components/upload/simple-proof-document-form.tsx](apps/frontend/src/modules/sinaes-management/components/upload/simple-proof-document-form.tsx)
- **Cambio:** `<input type="file" multiple>` + envío de varios `File` en el mismo `FormData`.
- **Backend:** `uploadFile` ya recibe un solo archivo; cambiar a `@UploadedFiles()` (plural) y subir todos a la misma subcarpeta.

#### 2.10 Frontend — UX para re-upload (detectar código existente)

- Cuando el usuario abre el formulario y selecciona una evidencia + tipo, hacer un check:
  - ¿Ya existe un documento para esta combinación?
  - Si sí → mostrar opción "Agregar archivos a la subida existente" vs "Crear nueva subida (CONV-002)".
- Si elige "agregar", el frontend usa `PATCH /:id/append-files` + `PATCH /:id/append-careers`.

---

### FASE 3 — Inventario de documentos por carrera (≈ 6–8 h, riesgo bajo)

Resuelve el punto 9. **No es un reporte de "cumplimiento" con umbral** — es un inventario:
*"La carrera X tiene N documentos subidos en estas ubicaciones de la jerarquía SINAES."*

#### 3.1 Nuevo endpoint backend: `documents-by-career`

- **Archivo:** `apps/backend/src/modules/sinaes-reports/sinaes-reports.service.ts`
- **Método nuevo:** `generateDocumentsByCareer(filters)`.
- **Lógica:**
  1. Traer carreras activas (filtrables por `careerIds[]` opcional).
  2. Para cada carrera, traer sus `careerProofDocuments` → `proofDocument` → `evidence` → `criterion`/`standard` → `component` → `dimension`.
  3. Construir el árbol de ubicaciones con conteos.
- **Estructura de respuesta:**
  ```ts
  {
    careers: [
      {
        id, code, name,
        totalDocuments: 23,                 // total de documentos asociados a esta carrera
        dimensions: [
          {
            id, code, name,
            documentCount: 8,               // documentos en esta dimensión
            components: [
              {
                id, code, name,
                documentCount: 5,
                criteria: [
                  {
                    id, code, name,
                    documentCount: 3,
                    standards: [...],       // mismo patrón
                    evidences: [
                      {
                        id, code, name,
                        documentCount: 2,
                        documents: [        // documentos concretos asociados
                          { id, code, name, fileUrl, createdAt }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        gaps: [   // ubicaciones donde la carrera NO tiene documentos (dato crudo, sin etiquetas)
          { dimensionCode, componentCode, criterionCode, standardCode, evidenceCode, evidenceName }
        ]
      }
    ],
    summary: {
      totalCareers,
      totalDocuments,            // total general (no doble-conteo por carrera)
      careersWithDocuments,      // # de carreras con al menos 1 documento
      careersWithoutDocuments    // # de carreras con 0 documentos
    }
  }
  ```

#### 3.2 DTOs nuevos

- **Archivo:** `apps/backend/src/modules/sinaes-reports/dtos/documents-by-career.dto.ts`
- Definir `CareerDocumentInventoryDto`, `CareerGapDto`, `DocumentsByCareerReportDto`.
- **Nota:** NO incluir campos `compliancePercentage` ni `complianceStatus` — solo conteos crudos.

#### 3.3 Endpoint REST y guards

- **Archivo:** `sinaes-reports.controller.ts`
- **Nuevo:** `GET /sinaes-reports/documents-by-career?careerIds=...&dimensionId=...&componentId=...&criterionId=...`
- Aplica los mismos guards que el reporte actual.

#### 3.4 Frontend — Tab "Inventario por Carrera"

- **Archivo:** `apps/frontend/src/app/sinaes/reports/page.tsx`
- Convertir la página a tabs: **"Cumplimiento Global"** (lo actual) y **"Inventario por Carrera"** (nuevo).
- Componentes nuevos en `components/reports/`:
  - `career-inventory-summary.tsx` — KPIs (# de carreras con docs, total de docs, # carreras sin nada).
  - `career-inventory-table.tsx` — tabla principal:
    - Filas: una por carrera.
    - Columnas: código, nombre, total documentos, **botón "Ver detalle"**.
    - Ordenable por total de docs (descendente por defecto).
  - `career-inventory-detail.tsx` — al hacer click en "Ver detalle", se expande un árbol Dim→Comp→Crit→Std→Evid con:
    - El conteo de documentos por nivel.
    - Lista de documentos concretos en cada evidencia (`code`, nombre, link a Drive).
    - Sección "Ubicaciones sin documentos" al final con la lista de evidencias donde esa carrera no tiene nada.
  - **Botón "Subir aquí"** en cada brecha → abre el form de upload con la evidencia y la carrera pre-seleccionadas.

#### 3.5 Frontend — Filtros

- En `compliance-filters.tsx`:
  - Agregar selector **multi-carrera** (multi-select). Si está vacío → todas las carreras activas.
  - Mantener filtros de Dim/Comp/Crit para acotar el inventario a una rama específica.

#### 3.6 Exportación PDF del inventario

- Extender `pdf-generator.service.ts` con una sección "Inventario por Carrera" que itera `careers[]` y por cada una imprime:
  - Encabezado con código y nombre de carrera + total de docs.
  - Árbol jerárquico con conteos.
  - Lista de brechas al final.

---

### FASE 4 — Pulido y hardening (≈ 3–4 h)

#### 4.1 Tests de integración
- Test: subir dos documentos concurrentes a la misma evidencia → ambos suben con códigos distintos.
- Test: re-subir mismo código con carreras diferentes → `_carreras.txt` contiene la unión.
- Test: eliminar dimensión con hijos → error con mensaje accionable, sin toast duplicado.

#### 4.2 Notificación de éxito mejorada
- Tras una subida, mostrar: *"Documento CONV-005 creado en `EV-001/CONV-005/` con 3 archivos y 12 carreras asociadas."* + link a Drive.

#### 4.3 Documentos legacy — NO migrar

- **Decisión confirmada:** no se ejecuta migración masiva.
- Documentos antiguos (`googleDriveUploadFolderId IS NULL`):
  - Permanecen planos en su carpeta de evidencia.
  - El frontend los muestra normalmente leyendo desde `googleDriveFolderId` y `googleDriveFileId`.
  - Operaciones de "agregar carreras" o "reemplazar archivo" siguen funcionando contra la ubicación vieja.
- **Solo las subidas nuevas** usan la estructura `Tipo/Code/`.
- Si en el futuro se quiere migrar, se hará caso por caso o con un script opt-in que **nunca elimina datos**.

---

## Orden de ejecución sugerido

```
[Día 1] FASE 1 completa (1.1, 1.2, 1.3) — visible inmediatamente para usuarios.
[Día 2-3] FASE 2.1 - 2.6 — refactor de Drive + DB como fuente de verdad.
[Día 4] FASE 2.7 - 2.10 — concurrencia + multi-archivo + UX de re-upload.
[Día 5-6] FASE 3 — reportes por carrera (lo más valioso para el admin).
[Día 7] FASE 4 — tests + migración de legacy.
```

---

## Checklist de validación por fase

### Fase 1 ✓
- [ ] Eliminar dimensión muestra UN toast (no dos).
- [ ] Eliminar dimensión con componentes activos muestra `AlertDialog` con el mensaje específico.
- [ ] El selector de carreras al subir muestra "X de Y carreras activas" y al usuario le da confianza visual.

### Fase 2 ✓
- [ ] Subir dos documentos a la misma evidencia → se crean dos carpetas (`CONV-001/` y `CONV-002/`).
- [ ] Subir el mismo `code` con menos carreras → el `_carreras.txt` se regenera con la unión, no se pierden carreras.
- [ ] Subir dos docs a dos ubicaciones distintas en paralelo → ambos suben con códigos distintos y sin error.
- [ ] Subir varios archivos en una sola operación → todos quedan en la misma carpeta de subida con un solo `_carreras.txt`.

### Fase 3 ✓
- [ ] El admin abre "Inventario por Carrera" y ve la lista de todas las carreras con su **total de documentos** (sin % ni semáforo).
- [ ] Click en "Ver detalle" de una carrera → árbol expandible `Dim → Comp → Crit → Std → Evidencia` con conteos y enlaces a los documentos en Drive.
- [ ] Cada brecha (ubicación con 0 docs para esa carrera) está listada al final del detalle.
- [ ] Botón "Subir aquí" desde la brecha → abre el form de upload con la evidencia y la carrera pre-seleccionadas.
- [ ] PDF exportado del inventario por carrera incluye el árbol y la lista de brechas.

### Fase 4 ✓
- [ ] Tests automatizados pasan.
- [ ] Documentos legacy migrados sin pérdida.
- [ ] No quedan referencias a `as any` ni `// TODO` en módulos críticos.

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Migración de Drive rompe archivos existentes | Media | Script con `--dry-run` + respaldo + rollback documentado |
| Race condition en códigos persiste tras transacción | Baja | Tests de carga + secuencias Postgres como plan B |
| Reporte por carrera lento con muchas carreras × muchas evidencias | Media | Query optimizada con `GROUP BY` + caché de 5 min por filtro |
| Toasts genéricos pierden mensajes específicos del backend | Baja | El `generic.hooks.ts` ya extrae `response.data.message`; verificar que pase el detalle |
| Cambio de schema rompe build en CI | Baja | Migración + Prisma generate antes del merge |

---

## Decisiones confirmadas

1. ✅ **DB es la fuente de verdad** del `_carreras.txt`; Drive sólo refleja lo que dice la DB.
2. ✅ **Carpeta por subida:** agrupada por tipo → `{TipoDocumento}/{Code}/` (ej. `Convenio/CONV-001/`).
3. ✅ **Vista matriz descartada** — basta con el inventario por carrera con drill-down.
4. ✅ **No migrar documentos legacy** — quedan planos en su carpeta de evidencia. Nada se elimina de la DB.
5. ✅ **Sin umbral de cumplimiento** — el reporte por carrera es un **inventario** (conteos crudos + ubicaciones), no un % de cumplimiento.

---

**Listo para arrancar.** Sugerencia: empezar por **FASE 1** (toasts duplicados, mensaje al eliminar dimensión, selector de carreras) para ganar visibilidad inmediata. Avísame y procedo.
