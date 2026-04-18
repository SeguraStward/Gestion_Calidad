# Errores y Fallos en Casos de Prueba

**Proyecto:** Sistema de Gestión Integral Universitario
**Evaluadores:** Bradley Segura Borbón, Brayan Carmona Garro
**Fecha de ejecución:** 31/03/2026 – 02/04/2026
**Curso:** Ingeniería en Sistemas III — UNA, Sede Región Brunca

---

## Resumen Ejecutivo

| ID | Módulo | Nombre | Severidad | Estado |
|---|---|---|---|---|
| CP-TJ-01 | Tiempos de Jornada | Visualización del Panel | Baja | Fallo parcial |
| CP-TJ-02 | Tiempos de Jornada | Asignación de Cursos a Profesores | Media | Fallo parcial |
| CP-TJ-06 | Tiempos de Jornada | Gestión de Proyectos Institucionales | Alta | Fallo crítico |
| CP-SGE-01 | Evidencias SINAES | Subida de Evidencias | Alta | Fallo crítico |
| CP-SGE-03 | Evidencias SINAES | Generación de Reporte | Alta | Fallo crítico |
| CP-SGE-04 | Evidencias SINAES | Edición de metadatos | Alta | Fallo crítico |

**Casos sin fallos:** CP-TJ-03, CP-TJ-04, CP-TJ-05, CP-TJ-07, CP-SGE-02

---

## Módulo: Tiempos de Jornada

### FALLO-01 — CP-TJ-01: Selección de carrera no visible en formulario de nueva asignación

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-TJ-01 |
| **Paso fallido** | Paso 4 |
| **Severidad** | Baja |
| **Tipo** | UI / Funcionalidad faltante |

**Descripción del fallo:**
Al hacer clic en "Nueva asignación" y completar el formulario seleccionando campus, carrera, ciclo y cantidad de jornadas, la selección de **carrera no se muestra visualmente** en el formulario. El proceso continúa (el resultado fue OK), pero el usuario no puede confirmar visualmente qué carrera seleccionó.

**Resultado esperado:** El campo de carrera seleccionada debe mostrarse en el formulario de manera legible.

**Resultado obtenido:** `OK (Pero no se muestra la selección de carrera).`

---

### FALLO-02 — CP-TJ-02: El formulario muestra créditos en lugar de horas de contacto

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-TJ-02 |
| **Paso fallido** | Paso 7 |
| **Severidad** | Media |
| **Tipo** | Datos incorrectos / Confusión de campos |

**Descripción del fallo:**
En el paso 4 del asistente de asignación de cursos al profesor, al seleccionar el Curso A ("Sede Regional Brunca", 4 horas), el sistema **muestra créditos en lugar de horas de contacto**. Esto puede inducir al usuario a seleccionar el tipo de jornada de manera incorrecta, ya que la normativa se basa en horas de contacto.

**Resultado esperado:** El formulario debe mostrar las **horas de contacto** del curso para que el usuario pueda determinar correctamente el tipo de jornada (1/4, 1/2, 3/4, Tiempo Completo).

**Resultado obtenido:** `OK (Nota: muestra créditos, no horas de contacto)`

---

### FALLO-03 — CP-TJ-02: Consumo en tarjetas del campus no es claro tras asignación

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-TJ-02 |
| **Paso fallido** | Paso 10 |
| **Severidad** | Media |
| **Tipo** | UI / Falta de feedback visual |

**Descripción del fallo:**
Después de completar ambas asignaciones al profesor Stward (Curso A y Curso B), el sistema sí muestra las asignaciones en el listado del profesor. Sin embargo, **no es claro el cambio reflejado en las tarjetas del campus correspondiente** ("Campus Pérez Zeledón"). El evaluador no pudo confirmar visualmente si el consumo de jornadas se actualizó en las tarjetas de resumen del campus.

**Resultado esperado:** Las tarjetas de resumen del campus deben reflejar de forma clara e inmediata el consumo adicional de jornadas tras cada asignación.

**Resultado obtenido:** `Se muestran las asignaciones al profesor en el listado, pero no está claro el cambio reflejado en las tarjetas del campus correspondiente.`

---

### FALLO-04 — CP-TJ-04: Contraste insuficiente en tarjetas del Resumen Anual

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-TJ-04 |
| **Paso fallido** | Paso 3 (recomendación) |
| **Severidad** | Baja |
| **Tipo** | UI / Accesibilidad |

**Descripción del fallo:**
Al visualizar el Resumen Anual de Jornadas con el año 2026, las tarjetas (Jornadas disponibles, Docencia requerida, Proyectos y gestión, Saldo) **presentan bajo contraste de color**. El evaluador lo registró como recomendación de mejora.

**Resultado esperado:** Las tarjetas deben tener contraste suficiente para ser legibles en distintas condiciones de iluminación y para usuarios con dificultades visuales.

**Resultado obtenido:** `OK (Recomendación: ajustar el contraste en los colores de las tarjetas)`

---

### FALLO-05 — CP-TJ-06: Proyecto institucional no aparece en la lista tras ser guardado

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-TJ-06 |
| **Paso fallido** | Paso 4 (y en cascada pasos 5, 6, 7) |
| **Severidad** | Alta — Fallo crítico |
| **Tipo** | Bug funcional / Backend o integración |

**Descripción del fallo:**
Al crear un nuevo proyecto institucional con los datos: Código "PI-2025-01", Título "Proyecto Investigación IA", Director "Saray", Campus "Sede Regional Brunca: PZ", Tipo Institucional, Horas requeridas: 20, Horas asignadas: 20, Fechas 01/01/2026 – 31/12/2026, y guardar el formulario, el **proyecto no aparece en la lista de proyectos institucionales**. Como consecuencia, ninguno de los pasos posteriores pudo completarse:

- Paso 5: No se verifican descuentos al saldo de jornadas (depende del paso 4).
- Paso 6: No se puede editar el título (depende del paso 4).
- Paso 7: No se puede verificar el cambio reflejado en la lista (depende del paso 4).

**Resultado esperado:** El proyecto recién creado debe aparecer inmediatamente en la lista de proyectos institucionales y sus horas asignadas deben descontarse del saldo disponible.

**Resultado obtenido:**
```
4. No aparece el proyecto en la lista de proyectos institucionales.
5. No se reflejan cambios
6. No se puede completar por error en paso 4
7. No se puede completar por error en paso 4
```

---

## Módulo: Evidencias SINAES

### FALLO-06 — CP-SGE-01: Error HTTP 400 al subir documento probatorio

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-SGE-01 |
| **Paso fallido** | Paso 4 (bloquea pasos 5 y 6) |
| **Severidad** | Alta — Fallo crítico |
| **Tipo** | Bug funcional / Error de integración con Google Drive o backend |

**Descripción del fallo:**
Al intentar subir el archivo "Plan_Estudios_2025.pdf" (<2 MB, formato PDF) clasificado en la Dimensión "Gestión Académica", Componente "Currículo", Criterio "C1.1", el sistema retorna un **error HTTP 400 (Bad Request)** al presionar el botón "Subir Documento". El mensaje de error mostrado al usuario es genérico: *"Error al subir el documento — Request failed with status code 400"*, sin indicar la causa específica.

Observaciones adicionales del evaluador:
- El archivo solo se puede seleccionar haciendo clic en el espacio, **no funciona drag & drop**.
- Para subir una evidencia es necesario seleccionar también "estándar" y "evidencia" (o solo "evidencia" si es evidencia directa), lo cual no es suficientemente claro en la UI.

**Resultado esperado:** El sistema debe cargar correctamente el documento, almacenarlo en Google Drive institucional, clasificarlo con los criterios seleccionados y confirmar la subida exitosa.

**Resultado obtenido:**
```
— Después de este paso no se pudo avanzar debido a que al darle a subir se recibió error 400
5. No se pudo trabajar por el error mencionado anteriormente.
6. No se pudo trabajar por el error mencionado anteriormente.
NOTA: Error sin mensaje claro
```

**Evidencia visual:** El toast de error muestra "Request failed with status code 400" sin contexto adicional.

---

### FALLO-07 — CP-SGE-03: Generación de reporte PDF falla — "Invalid Date" y sin datos

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-SGE-03 |
| **Paso fallido** | Paso 5 y 6 |
| **Severidad** | Alta — Fallo crítico |
| **Tipo** | Bug funcional — Date picker roto + Error en generación de PDF |

**Descripción del fallo:**
Al intentar generar un reporte de cumplimiento SINAES en PDF para la carrera "Ingeniería en Sistemas de Información" con criterios de la Dimensión "Gestión Académica", el sistema falla en dos niveles:

1. **Date picker con error visual grave:** El componente de selección de fechas tiene un bug de renderizado donde los encabezados de los días de la semana aparecen concatenados como `"mamijuvisádo"` en lugar de las abreviaturas correctas (Ma, Mi, Ju, Vi, Sá, Do). Además, los controles de navegación (`<` `>`) no son funcionales visualmente.

2. **Reporte no se genera:** Al hacer clic en "Generar reporte", la pantalla muestra:
   - Fecha: `"Invalid Date"`
   - "No hay estadísticas disponibles"
   - "No se encontraron dimensiones para los filtros seleccionados"
   - El PDF no se descarga.

El evaluador probó con diferentes fechas y datos sin éxito.

**Resultado esperado:** El sistema debe generar un PDF con las métricas de cumplimiento por carrera y criterios SINAES, descargarlo correctamente con contenido legible y coherente.

**Resultado obtenido:**
```
5. No se muestran los datos y da error al generar el pdf - Incluso al probar con diferentes fechas y datos
6. NO SE GENERA CORRECTAMENTE
```

**Evidencias visuales:**
- Date picker roto con texto concatenado `"mamijuvisádo"`
- Pantalla de resultados con "Invalid Date" y sin estadísticas

---

### FALLO-08 — CP-SGE-04: Application error al intentar editar metadatos de evidencia

| Campo | Detalle |
|---|---|
| **ID Caso** | CP-SGE-04 |
| **Paso fallido** | Pasos 1–6 (bloqueo total) |
| **Severidad** | Alta — Fallo crítico |
| **Tipo** | Bug crítico / Crash de aplicación (client-side exception) |

**Descripción del fallo:**
Al navegar a la sección de consulta de evidencias, localizar un documento y seleccionar la opción de **editar metadatos**, la aplicación arroja un error de excepción en el cliente que bloquea completamente la funcionalidad:

> `Application error: a client-side exception has occurred while loading gestion-calidad.arayaroma.software (see the browser console for more information).`

Este error impide:
- Modificar el componente asociado.
- Agregar criterios adicionales.
- Guardar cualquier cambio en los metadatos.

**Resultado esperado:** El sistema debe permitir editar la clasificación de una evidencia (componente, criterios), guardar los cambios y reflejarlos inmediatamente en la consulta.

**Resultado obtenido:**
```
1-6: Al seleccionar cualquier campo a editar aparece un error (ver imagen de evidencia).
```

**Evidencia visual:** Pantalla en blanco con el mensaje de error de Next.js/aplicación.

---

## Tabla de Observaciones y Recomendaciones (no fallos bloqueantes)

| ID Caso | Observación | Tipo |
|---|---|---|
| CP-SGE-01 | El campo de archivo no soporta drag & drop, solo clic | UX |
| CP-SGE-01 | La UI no deja claro que se debe seleccionar "estándar" + "evidencia" para subir un documento | UX / Documentación |
| CP-SGE-02 | Los datos usados en la consulta fueron genéricos porque CP-SGE-01 falló y no había evidencias del caso anterior | Dependencia entre casos |
| CP-TJ-04 | Contraste bajo en tarjetas del resumen anual | Accesibilidad |
