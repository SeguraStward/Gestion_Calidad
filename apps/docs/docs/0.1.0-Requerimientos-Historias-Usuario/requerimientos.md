---
sidebar_position: 1
---

# 0.1.1 Requerimientos

## 1. Requerimientos Funcionales

### 1.1 Módulo de Autenticación y Seguridad

- Inicio de sesión con credenciales de usuario (correo institucional y contraseña).
- Autenticación con Google utilizando el dominio institucional.
- Recuperación de contraseña con doble autenticación.
- Activación e inactivación de usuarios por parte de administradores.
- Gestión de roles y permisos específicos para distintos usuarios (administradores, profesores, estudiantes, revisores, etc.).
- Registro de actividad de inicio de sesión (IP, ubicación, dispositivo utilizado).
- Configuración de políticas de seguridad:
  - Expiración de contraseñas periódica.
  - Bloqueo de cuenta tras intentos fallidos repetidos.

### 1.2 Módulo de Perfil de Usuario

- Visualización del perfil con información básica (nombre, rol, permisos, correo).
- Edición de información personal (nombre, teléfono, foto de perfil).
- Personalización de interfaz con opciones de accesibilidad.
- Configuración de privacidad para definir la información visible a otros usuarios.

### 1.3 Módulo de Configuración General y Accesibilidad

- Configuración de parámetros generales del sistema.
- Opciones de accesibilidad avanzadas:
  - Escalado de fuente y zoom en contenido.
  - Modo de alto contraste, contraste negativo y escala de grises.
  - Subrayado de enlaces y resaltado de elementos interactivos.
  - Cambio a fuentes diseñadas para dislexia.
  - Restauración de configuraciones predeterminadas.
- Visualización de la interfaz como otro rol por parte de los administradores.

### 1.4 Módulo de Gestión Académica

- Gestión de carga académica de docentes y estudiantes:
  - Importación masiva de datos desde Excel con validaciones.
  - Asignación dinámica de profesores a cursos y sesiones.
  - Gestión de horarios y asignación de aulas.
- Administración de entidades académicas:
  - Sedes y campus.
  - Facultades y escuelas.
  - Carreras y programas académicos.
  - Cursos y asignaturas.

### 1.5 Módulo de Gestión de Experiencia y Producción

- Registro y gestión de formación académica de docentes.
- Registro de experiencia laboral docente.
- Gestión de producción intelectual (artículos, libros, investigaciones).
- Registro y administración de actividades PPAAS (Programas de Promoción de Aprendizaje y Asesoramiento).

### 1.6 Módulo de Trabajos de Graduación (TFG)

- Creación y listado de proyectos de TFG.
- Búsqueda y filtrado por estudiante, título, línea de investigación, año y estado.
- Gestión de revisiones y observaciones en proyectos.
- Notificaciones automáticas en cada etapa del TFG.
- Creación y seguimiento de sesiones de revisión.
- Visualización de proyectos abiertos, vencidos y próximos a vencer.

### 1.7 Módulo de Evaluación de Calidad y SINAES

- Gestión de modelos de evaluación basados en criterios SINAES:
  - Creación, edición y eliminación de componentes SINAES.
  - Gestión de dimensiones y criterios de evaluación.
  - Registro y vinculación de evidencias documentales.
- Registro de actividades académicas asociadas a criterios de calidad.

### 1.8 Módulo de Reportes y Estadísticas

- Generación de informes con filtros por estado, campus, curso y año.
- Reportes de tasas de reprobación por carrera y campus.
- Estadísticas de desempeño académico con gráficos dinámicos.
- Exportación de informes en formatos PDF, Excel y CSV.

### 1.9 Módulo de Gestión de Comisiones Académicas

- Creación de comisiones académicas con asignación de docentes y evaluadores.
- Importación de datos desde Excel.
- Listado y gestión de comisiones con filtros avanzados.

### 1.10 Módulo de Notificaciones y Alertas

- Notificaciones automáticas por correo y en el sistema.
- Creación de notificaciones personalizadas con plantillas e inteligencia artificial.
- Filtros avanzados de búsqueda y categorización.
- Generación de documentos PDF adjuntos en notificaciones.

### 1.11 Módulo de Auditoría e Historial

- Registro detallado de acciones de usuarios.
- Filtros avanzados en historial de auditoría.
- Exportación de registros en formatos CSV o JSON.

---

## 2. Requerimientos No Funcionales

### 2.1 Seguridad

- Autenticación segura y gestión de sesiones.
- Permisos granulares basados en roles.
- Registro de auditoría completo.

### 2.2 Usabilidad y Experiencia de Usuario

- Interfaz intuitiva, accesible y responsive.
- Personalización del entorno según preferencias.
- Notificaciones en tiempo real.

### 2.3 Interoperabilidad

- Importación/exportación de datos desde/hacia Excel.
- Integración con el servicio de correo institucional.
- Compatibilidad con sistemas académicos existentes.

### 2.4 Almacenamiento y Gestión de Archivos

- Definición clara de almacenamiento de documentos.
- Implementación de subida masiva de archivos.

---

## 3. Prioridades de Implementación

1. Migración del sistema existente con mantenimiento de datos históricos.
2. Implementación del módulo de carga académica.
3. Corrección y mejora del módulo de informes finales.
4. Desarrollo del módulo de TFG.
5. Optimización de reportes y estadísticas.
6. Mejora del sistema de comisiones académicas.
7. Automatización de notificaciones y envío de correos con PDF adjuntos.
