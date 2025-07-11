# Componentes estándar

Se definen en la carpeta "src/components/base" los componentes base.

Notas: los status pueden variar, pero todas las entidades tienen ese campo además de los campos de auditoría.
Los status normales son ACTIVE/INACTIVE. Algunas entidades tienen estados adicionales.

se usa los types de prisma y los enums (ya que no son entidades por aparte ). en algunas exepciones se define una personalizacion de la entidad de prisma, pero las mas simples se usa directamente desde prisma

Solo usar librerías de shadcn: "@una-gc/ui/components"

## Vista lista

- Filtros para campos relevantes (son parámetros que se pueden enviar al API para obtener una lista paginada de forma diferente). El filtro principal está en el status de la entidad con los valores principales de ACTIVE/INACTIVE.
- Paginación para grandes volúmenes de datos.
- Columnas que corresponden a los campos relevantes: texto, numéricos, enums, imagen pequeña, relaciones (con otras entidades), también hay campos que están compuestos en otros campos (similar a las relaciones pero dentro de la misma entidad).
- Acciones: crear, editar, ver, desactivar/activar.

## Vista visualización

- Muestra los datos completos de la entidad, incluidos los campos de auditoría.
- Acciones: edición.

## Vista de formulario

- Formulario para creación/edición.
- Incluye campos de texto, texto simple, numérico, email, número de teléfono, enums, relaciones (selección), y campos compuestos (por ejemplo, un campo de detalles que incluya campos adicionales para la entidad).

## Gestión de errores

- **Errores de validación**: Mostrar mensajes de error junto a cada campo del formulario cuando no cumpla con los requisitos.
- **Errores de API**: Capturar y mostrar mensajes de error del servidor de forma amigable.
- **Estados de carga**: Implementar indicadores visuales (spinners, skeleton loaders) durante operaciones asincrónicas.
- **Reintentos**: Ofrecer opción de reintentar operaciones fallidas cuando sea apropiado (solo manuales, no automáticos).
- **Manejo de sesión**: Detectar y gestionar errores de autenticación, redirigiendo al login cuando sea necesario.
- **Feedback visual**: Usar notificaciones toast/snackbar para informar sobre resultados de operaciones (éxito/error).

## Accesibilidad

- **Contraste adecuado**: Garantizar suficiente contraste entre texto y fondo para legibilidad.
- **Navegación por teclado**: Asegurar que todas las funcionalidades sean accesibles sin ratón.
- **Etiquetas ARIA**: Implementar atributos ARIA en componentes interactivos.
- **Textos alternativos**: Proporcionar alt text para todas las imágenes e iconos informativos.
- **Mensajes de error descriptivos**: Explicar claramente qué ha fallado y cómo solucionarlo.
- **Responsive design**: Garantizar usabilidad en diferentes dispositivos y tamaños de pantalla.
- **Focus visual**: Mantener indicadores visuales claros del elemento actualmente enfocado.

## Estructura lógica de organización para las páginas

<!-- Nota: la lógica de creación y edición usa lo mismo pero en diferentes lugares, puede ser diferentes segun se requiera -->

- entidad:
  - list
  - create
  - id (visualización)
    - edit (edita los datos)
