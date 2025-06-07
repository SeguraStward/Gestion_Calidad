---
sidebar_position: 1
---

# 0.1.1 Requerimientos

✅ Listo / Completado

🔄 En proceso / En progreso

❌ Sin terminar / Incompleto

## 1. Requerimientos Funcionales

### 1.1 Módulo de Autenticación y Seguridad (ESTEBAN SIBAJA GRANADOS SIBAJA) ESTE ES URGENTE

- Inicio de sesión con credenciales de usuario (correo institucional). ✅
- Autenticación con Google utilizando el dominio institucional. ✅
- Gestión de roles y permisos específicos para distintos usuarios (administradores, profesores, "ASISTENTES"). 🔄
- Registro de actividad de inicio de sesión (IP, ubicación, dispositivo utilizado). ❌

### 1.2 Módulo de Perfil de Gestión de Usuarios (FRANCISCO MORA CABEZAS) ESTE ES URGENTE

- Visualización del perfil con información básica (nombre, rol, permisos, correo).
- Edición de información personal (nombre, teléfono, foto de perfil).
- Personalización de interfaz con opciones de accesibilidad.
- Configuración de privacidad para definir la información visible a otros usuarios.
- Activación e inactivación de usuarios por parte de administradores. ❌

### 1.3 Módulo de Configuración General y Accesibilidad (FRANCISCO MORA CABEZAS) ESTE NO ES URGENTE

- Configuración de parámetros generales del sistema.
- Opciones de accesibilidad avanzadas:
  - Escalado de fuente y zoom en contenido.
  - Modo de alto contraste, contraste negativo y escala de grises.
  - Subrayado de enlaces y resaltado de elementos interactivos.
  - Cambio a fuentes diseñadas para dislexia.
  - Restauración de configuraciones predeterminadas.

### 1.4 Módulo de Gestión Académica (ESTEBAN JAVIER GRANADOS SIBAJA) ESTE ES URGENTE

(PAGINAR, FILTRAR, TABS, EDITAR, CRUD)

- Gestión de carga académica de docentes y estudiantes:
  - Importación masiva de datos desde Excel con validaciones. 🔄
  - Asignación dinámica de profesores a cursos y sesiones.
  - Gestión de horarios y asignación de aulas. [ QUE EL SEÑOR LO ESCONDA Y SE LE OLVIDE DONDE ]+
- Administración de entidades académicas:
  - Sedes y campus.
  - Facultades y escuelas.
  - Carreras y programas académicos.
  - Cursos y asignaturas.

### 1.5 Módulo de Gestión de Experiencia y Producción (ÁNGEL SEGURA MENDEZ) ESTE NO ES URGENTE

- Registro y gestión de formación académica de docentes.
- Registro de experiencia laboral docente.
- Gestión de producción intelectual (artículos, libros, investigaciones).
- Registro y administración de actividades PPAAS (Programas de Promoción de Aprendizaje y Asesoramiento).

### 1.6 Módulo de Trabajos de Graduación (TFG) (ÁNGEL SEGURA MENDEZ) ESTE NO ES URGENTE

- Creación y listado de proyectos de TFG.
- Búsqueda y filtrado por estudiante, título, línea de investigación, año y estado.
- Gestión de revisiones y observaciones en proyectos.
- Notificaciones automáticas en cada etapa del TFG.
- Creación y seguimiento de sesiones de revisión.
- Visualización de proyectos abiertos, vencidos y próximos a vencer.

### 1.7 Módulo de Evaluación de Calidad y SINAES (ESTEBAN JAVIER GRANADOS SIBAJA) ESTE NO ES URGENTE

- Gestión de modelos de evaluación basados en criterios SINAES:
  - Creación, edición y eliminación de componentes SINAES.
  - Gestión de dimensiones y criterios de evaluación.
  - Registro y vinculación de evidencias documentales.
- Registro de actividades académicas asociadas a criterios de calidad.

### 1.8 Módulo de Reportes y Estadísticas ESTE ES URGENTE

- Generación de informes con filtros por estado, campus, curso y año.
- Reportes de tasas de reprobación por carrera y campus.
- Estadísticas de desempeño académico con gráficos dinámicos. NO URGE
- Exportación de informes en formatos PDF, Excel y CSV. NO URGE

### 1.9 Informes finales de curso ESTE ES URGENTE EN EXCESO (EL MÁS IMPORTANTE)

- Genración de informes PDF
- Validación de cursos, estudiantes matriculados, desertores, reprobrados (CONTRAPONER CON EL PRISMA)

### 1.10 Módulo de Gestión de Comisiones Académicas (JUAN CARLOS CAMACHO SOLANO) ESTE NO ES URGENTE

- Creación de comisiones académicas con asignación de docentes y evaluadores.
- Importación de datos desde Excel.
- Listado y gestión de comisiones con filtros avanzados.

### 1.11 Módulo de Notificaciones y Alertas ESTE NO ES URGENTE

- Notificaciones automáticas por correo y en el sistema.
- Creación de notificaciones personalizadas con plantillas e inteligencia artificial.
- Filtros avanzados de búsqueda y categorización.
- Generación de documentos PDF adjuntos en notificaciones.

### 1.12 Módulo de Auditoría e Historial (JUAN CARLOS CAMACHO SOLANO) ESTE NO ES URGENTE

- Registro detallado de acciones de usuarios.
- Filtros avanzados en historial de auditoría.
- Exportación de registros en formatos CSV o JSON.

---

## 2. Requerimientos No Funcionales

### 2.1 Seguridad

- Autenticación segura y gestión de sesiones.
- Permisos granulares basados en roles.
- Registro de auditoría completo.

### 2.2 Usabilidad y Experiencia de Usuario SEGUNDO PLANO

- Interfaz intuitiva, accesible y responsive.
- Personalización del entorno según preferencias.
- Notificaciones en tiempo real.

### 2.3 Interoperabilidad

- Importación/exportación de datos desde/hacia Excel. URGE PERO NO TANTO
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
