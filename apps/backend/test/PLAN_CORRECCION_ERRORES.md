# Plan de Corrección de Errores — Casos de Prueba

**Proyecto:** Sistema de Gestión Integral Universitario
**Basado en:** ERRORES_CASOS_PRUEBA.md
**Fecha:** Abril 2026

---

## Priorización

| ID Fallo | Severidad | Esfuerzo estimado | Prioridad |
|---|---|---|---|
| FALLO-08 — Crash al editar metadatos | Crítica | Bajo | P0 |
| FALLO-05 — Proyecto institucional no aparece en lista | Crítica | Medio | P0 |
| FALLO-06 — Error 400 al subir evidencia | Crítica | Medio | P0 |
| FALLO-07 — PDF no se genera + date picker roto | Crítica | Medio | P0 |
| FALLO-02 — Muestra créditos en lugar de horas de contacto | Media | Bajo | P1 |
| FALLO-03 — Consumo en tarjetas del campus no es claro | Media | Bajo | P1 |
| FALLO-01 — Selección de carrera no visible en formulario | Baja | Bajo | P2 |
| FALLO-04 — Contraste insuficiente en tarjetas | Baja | Bajo | P2 |

---

## Correcciones P0 — Críticas (bloquean funcionalidades completas)

---

### CORRECCIÓN-01: Crash al editar metadatos de evidencia (FALLO-08)

**Caso:** CP-SGE-04
**Error:** `Application error: a client-side exception has occurred`

**Diagnóstico probable:**
El crash ocurre al abrir el diálogo de edición de metadatos. Es una excepción de cliente no manejada, probablemente causada por:
- Un campo `undefined` o `null` que se intenta renderizar como componente React (e.g., opciones de un selector cargadas como `undefined`)
- Una importación dinámica que falla silenciosamente
- El componente `EditDocumentDialog` en `apps/frontend/src/modules/sinaes-management/components/query/` intenta acceder a propiedades de un documento antes de que se carguen

**Archivos a revisar:**
- `apps/frontend/src/modules/sinaes-management/components/query/` — diálogo de edición
- Cualquier selector (dimensión, componente, criterio) dentro del formulario de edición

**Pasos de corrección:**
1. Abrir el componente del diálogo de edición de documentos
2. Identificar qué prop o variable es `null`/`undefined` cuando se abre el diálogo con un documento existente
3. Agregar guards (`?.` optional chaining) o valores por defecto en los campos del formulario antes del render
4. Agregar un `try/catch` o error boundary alrededor del diálogo para que un crash en el formulario no tire toda la aplicación
5. Verificar que los selects (dimensión, componente, criterio) precarguen su valor actual al abrir el diálogo de edición

**Verificación:**
- Abrir la consulta de documentos → seleccionar un documento → clic en editar → el formulario debe abrirse sin crash
- Modificar componente y criterio → guardar → los cambios deben reflejarse en la lista

---

### CORRECCIÓN-02: Proyecto institucional no aparece en lista tras guardar (FALLO-05)

**Caso:** CP-TJ-06
**Error:** El proyecto se crea (formulario acepta) pero no aparece en la lista

**Diagnóstico probable:**
- El endpoint POST del backend devuelve éxito pero el frontend no invalida/refresca el query de la lista
- La lista usa un filtro por `status` o `campusId` que excluye el proyecto recién creado
- El proyecto se guarda con un campo requerido faltante que lo marca como inactivo y el filtro de la lista excluye inactivos
- Posible race condition: el `onSuccess` del mutation invalida el query pero la refetch no ocurre porque el componente ya no está montado

**Archivos a revisar:**
- Componente de la lista de proyectos institucionales en `apps/frontend/src/modules/` (módulo de tiempos de jornada, proyectos)
- El mutation hook de creación de proyectos y su `onSuccess` (invalidación de query)
- El endpoint backend de creación de proyectos (`POST /institutional-projects` o equivalente)

**Pasos de corrección:**
1. Verificar en el backend que el proyecto se está guardando correctamente (consultar DB después de crear)
2. Si el backend guarda correctamente, el problema está en el frontend:
   - Revisar el `onSuccess` del mutation hook — debe invalidar el query key correcto
   - Verificar que el query key usado en `invalidateQueries` coincide exactamente con el usado en `useQuery` de la lista
3. Si la lista filtra por `status=ACTIVE` y el proyecto se crea como `DRAFT`, agregar el status correcto al DTO de creación o cambiar el filtro de la lista
4. Si es un problema de campusId, verificar que el campus seleccionado en el formulario se pasa correctamente al backend

**Verificación:**
- Crear proyecto con todos los campos → el proyecto aparece inmediatamente en la lista
- Las horas asignadas se descuentan del saldo disponible en el resumen
- El proyecto se puede editar y el cambio se refleja en la lista

---

### CORRECCIÓN-03: Error 400 al subir evidencia SINAES (FALLO-06)

**Caso:** CP-SGE-01
**Error:** HTTP 400 al POST `/proof-documents/upload` — sin mensaje claro al usuario

**Diagnóstico probable:**
El backend retorna 400 (Bad Request) lo que indica que la validación del DTO está fallando. Causas más probables:
- El campo `evidenceId` enviado en el FormData no corresponde a una evidencia existente en la DB (el usuario seleccionó criterio pero no evidencia correctamente)
- `careerIds` se envía como string JSON vacío o malformado
- El usuario no tiene `googleAccessToken` guardado (nunca inició sesión con Google OAuth en producción) — el backend lanza 400 o 401 sin mensaje descriptivo
- El archivo supera algún límite de tamaño configurado en NestJS (`@nestjs/platform-express` tiene límite de 1MB por defecto si no se configura)

**Archivos a revisar:**
- `apps/backend/src/modules/proof-documents/proof-documents.controller.ts` — interceptor de archivo y validación del DTO
- `apps/backend/src/modules/google-drive/google-drive.service.ts` — verificar que el error de auth retorna 401 y no 400
- `apps/frontend/src/modules/sinaes-management/components/upload-documents-tab.tsx` — manejo de error y mensaje al usuario

**Pasos de corrección:**
1. **Backend — mejorar mensajes de error:**
   - En el controller de upload, capturar errores de validación y retornar mensajes descriptivos (e.g., "evidenceId inválido", "token de Google no disponible", "archivo muy grande")
   - Asegurarse que el límite de tamaño de archivo en el interceptor de Multer esté configurado explícitamente (mínimo 10MB)
2. **Backend — verificar validación del DTO:**
   - Confirmar que `evidenceId` se valida como UUID existente en DB antes de intentar la subida a Drive
   - Si el error es de autenticación Google, retornar 401 con mensaje claro
3. **Frontend — mejorar UX de errores:**
   - En `upload-documents-tab.tsx`, parsear la respuesta de error del backend y mostrar mensajes específicos al usuario en lugar de "Request failed with status code 400"
   - Si el error es de Google auth, mostrar alerta con botón "Volver a iniciar sesión con Google" que redirija a `NEXT_PUBLIC_GOOGLE_LOGIN_URL`
4. **Frontend — agregar drag & drop:**
   - El input de archivo debe aceptar drag & drop además del clic

**Verificación:**
- Subir un archivo PDF <2MB con evidencia seleccionada → el documento aparece en la lista
- Subir sin seleccionar evidencia → mensaje de error claro
- Subir con token de Google expirado → mensaje de re-autenticación

---

### CORRECCIÓN-04: Generación de reporte PDF falla + date picker roto (FALLO-07)

**Caso:** CP-SGE-03
**Errores:** (1) Date picker con texto concatenado, (2) "Invalid Date" en resultados, (3) PDF no se genera

**Diagnóstico:**

**Error 1 — Date picker:**
El componente de calendario tiene un bug de CSS/renderizado donde los nombres de los días de la semana se concatenan. Probablemente el contenedor no tiene suficiente ancho o el componente de librería (shadcn/ui o react-day-picker) tiene estilos rotos.

**Error 2 y 3 — "Invalid Date" y sin datos:**
- La fecha seleccionada en el date picker no se está pasando correctamente al estado del formulario (posiblemente el handler `onChange` no captura bien el valor o lo pasa como objeto `Date` y se serializa como "Invalid Date" al convertir a string)
- El filtro `dateFrom`/`dateTo` que llega al backend tiene valor inválido → el backend retorna resultado vacío
- Si `dateFrom` es inválido, la query de cumplimiento puede no retornar dimensiones → la UI muestra el estado vacío

**Archivos a revisar:**
- Componente de generación de reportes SINAES (página de reportes de cumplimiento)
- El date picker usado en el formulario de filtros
- El servicio/hook que llama al endpoint `GET /sinaes-reports/compliance`

**Pasos de corrección:**
1. **Arreglar date picker — CSS:**
   - Verificar que el contenedor del calendario tiene ancho mínimo suficiente (mínimo 280px)
   - Revisar que los estilos de `react-day-picker` o shadcn Calendar component están correctamente importados
   - Si se usa un locale español personalizado, verificar que las abreviaturas de días están bien definidas

2. **Arreglar serialización de fecha:**
   - En el handler `onChange` del date picker, convertir explícitamente el `Date` a ISO string antes de guardarlo en el estado: `setDateFrom(date?.toISOString() ?? null)`
   - Antes de enviar la query, validar que `dateFrom` y `dateTo` son fechas válidas con `!isNaN(new Date(dateFrom).getTime())`
   - Si las fechas son opcionales, permitir que el reporte se genere sin fechas (enviando `undefined` en lugar de "Invalid Date")

3. **Validación antes de generar:**
   - Deshabilitar el botón "Generar Reporte" si alguna fecha ingresada es inválida
   - Mostrar mensaje de validación inline en el campo de fecha si el valor es inválido

**Verificación:**
- Abrir el date picker → los días de la semana se muestran correctamente (Lu, Ma, Mi, Ju, Vi, Sá, Do)
- Seleccionar carrera y dimensión sin fechas → el reporte se genera correctamente
- Seleccionar fechas válidas → el reporte incluye solo documentos del rango de fechas
- Hacer clic en "Exportar PDF" → el archivo se descarga con contenido correcto

---

## Correcciones P1 — Medias (funcionalidad incorrecta o confusa)

---

### CORRECCIÓN-05: El formulario muestra créditos en lugar de horas de contacto (FALLO-02)

**Caso:** CP-TJ-02 — Paso 7 del asistente de asignación de cursos

**Archivos a revisar:**
- Componente del paso 4 del asistente de asignación de cursos a profesor
- El campo que muestra la información del curso seleccionado

**Pasos de corrección:**
1. Identificar el campo que renderiza la información del curso en el paso 4 del asistente
2. Cambiar el campo mostrado de `credits` (o `creditos`) a `contactHours` (o el nombre del campo de horas de contacto en el modelo de curso)
3. Actualizar el label de "Créditos" a "Horas de contacto" en la UI
4. Verificar que el backend retorna el campo de horas de contacto en el endpoint de cursos (si no existe, agregarlo al DTO)

**Verificación:**
- En el paso 4 del asistente, el curso debe mostrar sus horas de contacto (e.g., "4 horas de contacto")
- La información debe coincidir con el tipo de jornada sugerido (4h → 1/4 Tiempo según la normativa)

---

### CORRECCIÓN-06: Consumo en tarjetas del campus no refleja cambios claramente (FALLO-03)

**Caso:** CP-TJ-02 — Paso 10

**Archivos a revisar:**
- Las tarjetas de resumen de campus en la pestaña "Asignaciones" del panel de tiempos
- El query de datos del campus y su invalidación tras crear una asignación de profesor

**Pasos de corrección:**
1. Verificar que el mutation hook de "crear asignación de profesor" invalida el query de datos del campus en su `onSuccess`
2. Si la tarjeta del campus no se actualiza, agregar `queryClient.invalidateQueries(['campus-summary'])` (o el key correspondiente) en el `onSuccess`
3. Si la actualización ocurre pero visualmente no es evidente, agregar un indicador visual (e.g., animación de highlight o badge de "actualizado") en las tarjetas del campus cuando sus valores cambian

**Verificación:**
- Después de asignar un curso a un profesor en un campus, las tarjetas de ese campus deben reflejar el nuevo consumo de jornadas de forma inmediata y visible

---

## Correcciones P2 — Bajas (UX y accesibilidad)

---

### CORRECCIÓN-07: Selección de carrera no visible en formulario de nueva asignación (FALLO-01)

**Caso:** CP-TJ-01 — Paso 4

**Archivos a revisar:**
- Formulario de "Nueva asignación" en la pestaña Asignaciones del panel de tiempos
- El componente selector de carrera dentro del formulario

**Pasos de corrección:**
1. Verificar que el selector de carrera tiene el `value` y `onChange` correctamente enlazados con el estado del formulario (react-hook-form o estado local)
2. Revisar si el componente selector tiene algún problema de z-index o visibilidad que oculta la opción seleccionada
3. Si usa un `Select` de shadcn/ui, confirmar que el `value` prop muestra el texto de la opción seleccionada (no solo el ID)

**Verificación:**
- Al seleccionar una carrera en el formulario de nueva asignación, el nombre de la carrera debe ser visible en el campo selector

---

### CORRECCIÓN-08: Contraste insuficiente en tarjetas del Resumen Anual (FALLO-04)

**Caso:** CP-TJ-04 — Paso 3 (recomendación de accesibilidad)

**Archivos a revisar:**
- Componente de tarjetas en la página "Resumen Anual de Jornadas"
- Variables de color o clases de Tailwind usadas en las tarjetas

**Pasos de corrección:**
1. Identificar las clases de color de fondo y texto de las cuatro tarjetas (Jornadas disponibles, Docencia requerida, Proyectos y gestión, Saldo)
2. Verificar el contraste usando la regla WCAG AA (ratio mínimo 4.5:1 para texto normal)
3. Ajustar los colores de texto o fondo para cumplir el ratio mínimo de contraste

**Verificación:**
- Las cuatro tarjetas del resumen anual deben ser legibles con texto de alto contraste sobre sus fondos respectivos

---

## Observaciones UX adicionales (sin ticket de bug)

### OBS-01: Drag & drop no funciona en subida de evidencias
**Módulo:** CP-SGE-01
**Descripción:** El área de carga de archivos en SINAES solo acepta selección por clic. Implementar drag & drop mejoraría la experiencia.
**Acción sugerida:** Agregar atributos `onDragOver`, `onDrop` al área de carga del archivo en `upload-documents-tab.tsx`.

### OBS-02: UI no deja claro que se debe seleccionar "evidencia" para subir
**Módulo:** CP-SGE-01
**Descripción:** El flujo requiere seleccionar Dimensión → Componente → Criterio → Estándar → Evidencia (o Evidencia directa), pero la UI no guía al usuario en este orden de manera explícita.
**Acción sugerida:** Agregar texto de ayuda o tooltips que indiquen que "Evidencias SINAES" debe tener al menos una evidencia seleccionada para poder subir el documento.

### OBS-03: CP-SGE-02 usó datos genéricos por dependencia con CP-SGE-01
**Nota:** La prueba CP-SGE-02 (Consulta de Evidencia) pasó correctamente pero con datos genéricos, no con los datos del caso CP-SGE-01 porque este falló. Una vez que se corrija FALLO-06, se debe re-ejecutar CP-SGE-02 con los datos del test anterior para validar el flujo completo.

---

## Orden de implementación recomendado

```
1. CORRECCIÓN-01 — Crash edición metadatos     (1-2h)
2. CORRECCIÓN-03 — Error 400 subida evidencia  (2-4h)
3. CORRECCIÓN-04 — Date picker + PDF falla     (2-3h)
4. CORRECCIÓN-02 — Proyecto no aparece en lista (2-4h)
5. CORRECCIÓN-05 — Créditos vs horas contacto  (1h)
6. CORRECCIÓN-06 — Tarjetas campus sin refresh (1h)
7. CORRECCIÓN-07 — Carrera no visible          (1h)
8. CORRECCIÓN-08 — Contraste tarjetas          (30min)
```

---

## Re-ejecución de casos de prueba tras correcciones

Una vez aplicadas las correcciones, ejecutar los casos en este orden:

| Orden | Caso | Razón |
|---|---|---|
| 1 | CP-SGE-01 | Verificar subida de evidencias funciona |
| 2 | CP-SGE-04 | Verificar edición de metadatos sin crash |
| 3 | CP-SGE-03 | Verificar generación de PDF (depende de tener evidencias) |
| 4 | CP-SGE-02 | Re-ejecutar con datos reales del CP-SGE-01 |
| 5 | CP-TJ-06 | Verificar que proyecto aparece en lista |
| 6 | CP-TJ-02 | Verificar horas de contacto y tarjetas de campus |
| 7 | CP-TJ-01 | Verificar selección de carrera visible |
| 8 | CP-TJ-04 | Verificar contraste de tarjetas |
