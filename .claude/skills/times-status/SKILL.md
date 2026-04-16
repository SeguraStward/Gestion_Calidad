---
name: times-status
description: Reporta estado real del módulo Tiempos de Jornada verificando código contra memoria. Úsala cuando el usuario pregunte "¿dónde quedamos?", "qué falta", "estado", "pendientes", "qué hice ayer", "retomar", al inicio de sesión, o cuando pida priorizar trabajo por fin de semestre.
---

# Estado del módulo Tiempos de Jornada

## Cómo reportar estado — protocolo obligatorio

Memoria decae rápido. **Nunca afirmes que algo está hecho solo porque la memoria lo dice.** Verifica contra el código antes de responder.

### Paso 1: Leer memoria de estado
```
memory/project_times_estado.md
```
Trátala como hipótesis, no como verdad.

### Paso 2: Verificar contra git (últimos 30 días)
```bash
cd c:/dev/Gestion_Calidad && git log --since="30 days ago" --oneline
cd c:/dev/Gestion_Calidad && git log --oneline -20 -- apps/backend/src/modules/cohorts apps/backend/src/modules/course-reports apps/backend/src/modules/professor-portal apps/frontend/src/modules/times-management apps/frontend/src/app/portal-profesor
cd c:/dev/Gestion_Calidad && git status
```

### Paso 3: Verificar existencia real de archivos clave
Antes de afirmar que un módulo existe, confirma con Glob/Bash. Ejemplos:
- `apps/backend/src/modules/cohorts/cohorts.service.ts`
- `apps/backend/src/modules/course-reports/course-reports.service.ts`
- `apps/backend/src/modules/professor-portal/professor-portal.controller.ts`
- `apps/frontend/src/modules/times-management/pages/professor-portal-page.tsx`
- `apps/frontend/src/app/portal-profesor/page.tsx`
- `packages/database/prisma/schema/professor-portal-token.prisma`

### Paso 4: Reportar punch list priorizado

Estructura del reporte:

```
## Estado verificado (al <fecha>)

### ✅ Hecho (confirmado en código + git)
- <módulo/fase>: <commit SHA corto> — <resumen 1 línea>

### 🟡 En progreso / parcial
- <qué falta concretamente>

### 🔴 Pendiente — bloquea entrega
- <tarea> — razón por la que es crítico

### ⚠️ Memoria desactualizada
- <fact que en memoria aparece como hecho pero el código dice otra cosa>
```

Al final: **propón 1–3 próximos pasos ordenados por impacto** (no por facilidad).

## Fases del módulo — referencia

| Fase | Descripción | Dependencias |
|------|-------------|--------------|
| 1 | Limpieza tab Demanda (datos mock eliminados) | — |
| 2 | Schema Prisma para cohortes/reports/portal | — |
| 3 | Journey-time-configs + conversión horas→jornada | — |
| 4 | Backend cohorts/course-reports/professor-portal | Fase 2 |
| 5 | Tab Cohortes en times-admin (UI + store + service) | Fase 4 |
| 6 | Portal del Profesor (/portal-profesor) funcional end-to-end | Fase 4 |
| 7 | Config movida a subpágina `/times-management/configuracion` | Fase 5 |
| 8 | Flujo integrado: cohortes → malla → jornadas → asignación | Fases 4-7 |
| 9 | Reportes, exports, dashboard de balance | Fase 8 |
| 10 | Testing + evidencia para TFM | todas |

## Criterios de priorización (tiempo limitado)

1. **Lo que desbloquea a Erick/profesores en uso real** > pulido.
2. **Lo que afecta datos en producción** (migraciones, integridad) > UI.
3. **Lo que impide demo de entrega TFM** > features secundarias.
4. **Testing mínimo** del flujo crítico (portal profesor, cálculo de jornadas) antes de pulido.

## Al finalizar la sesión
Si hubo avances significativos, propón al usuario actualizar `memory/project_times_estado.md` con fecha y las fases que cambiaron.
