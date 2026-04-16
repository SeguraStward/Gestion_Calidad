---
name: times-erick
description: Bitácora de reuniones y acuerdos con Erick (stakeholder del módulo de Tiempos). Úsala cuando el usuario mencione "Erick", "reunión", "la reunión", "lo que dijo", "lo que me pidió", "acuerdo", "lo último que hablamos", "requerimiento nuevo", o quiera guardar/consultar decisiones del stakeholder.
---

# Bitácora Erick — Stakeholder del módulo

Erick es el usuario real que actualmente mantiene el Excel "Análisis-Brunca 2026.xlsx". El sistema web debe reemplazarlo. Sus requerimientos son autoridad sobre el diseño del módulo.

## Archivo de bitácora

Todas las reuniones y acuerdos se guardan en:
```
memory/erick_meetings.md
```

Si el archivo no existe, créalo con este encabezado:

```markdown
---
name: Bitácora reuniones Erick
description: Historial de reuniones, acuerdos y requerimientos del stakeholder del módulo de Tiempos
type: project
---

# Bitácora Erick

Cada entrada: `## YYYY-MM-DD — <título corto>` seguida de secciones **Contexto**, **Acuerdos**, **Pendientes**, **Decisiones rechazadas** (si aplica).
```

## Cómo guardar una reunión nueva

Cuando el usuario diga "guarda esto de la reunión", "apunta este acuerdo con Erick", etc.:

1. Confirma la **fecha** (si no la dio, usa la de hoy y dilo explícito).
2. Escribe entrada en `erick_meetings.md` al INICIO del archivo (más recientes arriba) con este formato:

```markdown
## 2026-04-15 — <título corto y específico>

**Contexto:** <qué se estaba discutiendo / de qué nació>

**Acuerdos:**
- <acuerdo 1>
- <acuerdo 2>

**Pendientes (para Franko):**
- [ ] <tarea concreta> — <prioridad/plazo si lo mencionó>

**Decisiones rechazadas:**
- <algo que se descartó y por qué — útil para no repetir propuestas>

**Impacto en código:**
- <archivo/módulo afectado, si se identificó>
```

3. Si el acuerdo afecta una decisión arquitectónica previa, **actualiza también** `memory/project_times_estado.md`.
4. Si hay pendientes con plazo, recuérdalos cuando el usuario pida "qué falta" (la skill `times-status` debe leer este archivo también).

## Cómo consultar la bitácora

Cuando el usuario pregunte "¿qué dijo Erick sobre X?", "¿qué quedamos en la última reunión?":

1. Lee `memory/erick_meetings.md` completo (es cronológico inverso, lo reciente arriba).
2. Filtra por el tema preguntado.
3. Responde con: **fecha + acuerdo textual + estado de pendientes relacionados**.
4. Si hay contradicciones entre reuniones, señala cuál es la más reciente y gana.

## Reglas

- **No inventes acuerdos.** Si no aparece en la bitácora, dilo: "no tengo registro de eso, ¿quieres que lo guarde ahora?".
- **Convierte fechas relativas a absolutas** al guardar ("el martes pasado" → `2026-04-07`).
- **Si Erick contradijo una decisión previa**, marca la antigua como ❌ tachada en lugar de borrarla — sirve como historial.
- **Pendientes completados** se marcan `[x]` pero no se borran hasta cerrar la entrega.
- Tras cada reunión nueva, propón actualizar `project_times_estado.md` si el alcance cambió.

## Qué cuenta como información valiosa para guardar

Guardar ✅:
- Requerimientos funcionales nuevos o cambios de scope.
- Reglas de negocio del Excel que no están en código.
- Preferencias de UI/UX específicas ("que se vea como el Excel").
- Plazos y prioridades que él expresa.
- Casos de uso específicos con ejemplos reales.

No guardar ❌ (redundante):
- Lo que ya está en `project_times_estado.md` como decisión arquitectónica estable.
- Detalles de implementación que Claude puede derivar del código.
- Comentarios genéricos sin acción ("le gustó el demo").
