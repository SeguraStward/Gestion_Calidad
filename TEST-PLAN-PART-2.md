# Plan de Testing (Parte 2) — Extensiones y Módulos SINAES

> **Propósito**: Ampliación de la evidencia académica (Capítulo V) sumando la cobertura para la etapa de Evaluación SINAES, Reportes, Preguntas y Roles de Usuario.
> **Framework**: Jest 29 + NestJS Testing Module + TypeScript  
> **Ubicación de specs**: `apps/backend/test/src/modules/`  

---

## FASE 7 — Módulo de Reportes Finales (`final-reports`)

> **Tipo**: Prueba Unitaria y Modular  
> **Objetivo**: Asegurar la integridad en el manejo de trabajos finales de graduación y reportes de investigación.

### Archivos a crear
- `test/src/modules/final-reports/final-reports.service.spec.ts`

### Casos de Prueba (Service)
| # | Método/Endpoint | Caso de prueba esperado |
|---|-----------------|-------------------------|
| 1 | `save`          | Crea un `FinalReport` exitosamente validando el DTO |
| 2 | `findById`       | Retorna el reporte correctamente enlazado al Proyecto asociado |
| 3 | `deleteById`     | Lanza `BadRequestException` si tiene documentos/adjuntos activos |

---

## FASE 8 — Gestión Extendida de Usuarios (`users`, `user-roles`, `user-permissions`)

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Poner a prueba la capa de RBAC (Role-Based Access Control) que sustenta la seguridad institucional.

### Archivos a crear
- `test/src/modules/user-roles/user-roles.service.spec.ts`
- `test/src/modules/user-permissions/user-permissions.service.spec.ts`
*(Nota: Parte de `users` se testeó en la Fase 2/5, aquí probaremos el motor de roles).*

### Casos de Prueba
| # | Método | Caso de prueba esperado |
|---|--------|-------------------------|
| 1 | `UserRoles.save` | Impide crear un rol duplicado (Conflicto de nombre) |
| 2 | `UserRoles.findAll` | Lista roles con sus respectivos permisos integrados |
| 3 | `UserPermissions.findAll` | Valida que los permisos estructurados se retornen correctamente |

---

## FASE 9 — Gestión de Evidencias SINAES

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Pruebas críticas del core del sistema: Recolección y reporte al SINAES. 

### Archivos a crear
- `test/src/modules/standard-evidences/standard-evidences.service.spec.ts`
- `test/src/modules/sinaes-document-history/sinaes-document-history.service.spec.ts`
- `test/src/modules/sinaes-reports/sinaes-reports.service.spec.ts`
- `test/src/modules/sinaes-reports/pdf-generator.service.spec.ts`

### Casos de Prueba
| # | Módulo | Caso de prueba esperado |
|---|--------|-------------------------|
| 1 | `StandardEvidences` | Permite subir y enlazar una evidencia con un criterio SINAES válido |
| 2 | `SinaesDocumentHistory` | Registra el log de trazabilidad al modificar un documento clave |
| 3 | `SinaesReports` | Genera el JSON estructurado con el resumen de cumplimiento SINAES |
| 4 | `PdfGeneratorService` | Retorna un Buffer o Stream conteniendo la estructura PDF generada |

---

## FASE 10 — Gestión de Bancos de Preguntas (`questions`, `question-groups`)

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Validar el funcionamiento de encuestas, ponderaciones y recolección de métricas.

### Archivos a crear
- `test/src/modules/questions/questions.service.spec.ts`
- `test/src/modules/question-groups/question-groups.service.spec.ts`

### Casos de Prueba
| # | Módulo | Caso de prueba esperado |
|---|--------|-------------------------|
| 1 | `QuestionGroups` | Lanza `BadRequestException` al intentar borrar un grupo con preguntas activas |
| 2 | `Questions` | Calcula y valida el tipo de pregunta (Numérica, Texto, Escala) |
| 3 | `Questions` | Asocia correctamente la pregunta a la dimensión SINAES indicada |

---

## Estrategia de Ejecución

Para ejecutar cada fase, usaremos el mismo patrón de evidencia que nos garantizó el éxito en las fases 1-6:

```bash
# Ejemplo: Correr la Fase 9 (Evidencias SINAES) y generar output JSON
cd /home/segurastward/Documents/Projects/gestion-calidad/apps/backend
pnpm test --testPathPattern="standard-evidences|sinaes-document-history|sinaes-reports" -- --json --outputFile=../../test-results/fase-9.json
```