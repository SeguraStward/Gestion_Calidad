# 📋 Módulo de Gestión de Tiempos de Jornada

## 🚀 Acceso desde la Aplicación

### Opción 1: Navegación desde el Sidebar (Recomendado)

1. **Inicia sesión** en la aplicación
2. En el **sidebar izquierdo**, busca la sección **"Gestión de Tiempos de Jornada"** 
3. Despliega el menú y verás dos opciones:
   - **Panel de Tiempos** → `/times-management`
   - **Proveedores y Proyectos** → `/times-management/extensions` ⭐

### Opción 2: URL Directa

Accede directamente a: `http://localhost:3001/times-management/extensions`

---

## 🎯 Funcionalidades

### 🏢 Proveedores Externos

Gestiona universidades, convenios y acuerdos que proveen horas de jornada adicionales.

**¿Cómo crear un proveedor?**
1. Clic en la pestaña **"Proveedores Externos"**
2. Clic en el botón **"Nuevo Proveedor"** (esquina superior derecha)
3. Completa el formulario:
   - **Nombre*** (obligatorio): Ej. "Universidad de Costa Rica"
   - **Tipo de Proveedor***: Universidad, Convenio, Intercambio u Otro
   - **Horas Provistas*** (obligatorio): Cantidad de horas que aporta
   - **Contacto** (opcional): Persona, email y teléfono
   - **Fechas** (opcional): Inicio y fin del convenio
   - **¿Tiempo fijo?**: Marca si las horas son fijas o variables
4. Clic en **"Crear Proveedor"**

**Estadísticas Disponibles:**
- 📊 Total de proveedores registrados
- ⏱️ Horas totales provistas
- ✅ Proveedores activos
- 📈 Promedio de horas por proveedor

**Acciones sobre proveedores:**
- 👁️ **Ver detalles**: Información completa del proveedor
- ✏️ **Editar**: Modificar información
- 🗑️ **Eliminar**: Borrar proveedor (con confirmación)

---

### 💼 Proyectos Institucionales

Gestiona proyectos que requieren asignación de tiempo de jornada de profesores.

**¿Cómo crear un proyecto?**
1. Clic en la pestaña **"Proyectos Institucionales"**
2. Clic en el botón **"Nuevo Proyecto"** (esquina superior derecha)
3. Completa el formulario:
   - **Código*** (obligatorio): Identificador único (Ej. "PROJ-2025-001")
     - ⚠️ **No se puede modificar después de crear**
   - **Título*** (obligatorio): Nombre del proyecto
   - **Descripción** (opcional): Detalles del proyecto
   - **Objetivos** (opcional): Metas específicas
   - **Tipo de Proyecto***: Institucional, Investigación, Extensión u Otro
   - **Horas Requeridas*** (obligatorio): Tiempo total necesario
   - **Horas Asignadas** (opcional): Tiempo ya asignado (default: 0)
   - **Fechas*** (obligatorio): Inicio y fin del proyecto
4. Clic en **"Crear Proyecto"**

**Estadísticas Disponibles:**
- 📊 Total de proyectos registrados
- ✅ Proyectos activos en ejecución
- ⏱️ Horas requeridas totales
- 📈 Horas asignadas con % de capacidad

**Indicador Visual:**
- Cada proyecto muestra una **barra de progreso** que indica:
  - 🔴 **Rojo** (< 75%): Requiere más asignaciones
  - 🟡 **Amarillo** (75-99%): Cerca de completar
  - 🟢 **Verde** (≥ 100%): Capacidad completa

**Acciones sobre proyectos:**
- 👁️ **Ver detalles**: Información completa del proyecto
- 👥 **Gestionar asignaciones**: (Próximamente) Asignar profesores
- ✏️ **Editar**: Modificar información
- 🗑️ **Eliminar**: Borrar proyecto (con confirmación)

---

## 🎨 Características de la Interfaz

### Tabs (Pestañas)
Alterna fácilmente entre:
- **Proveedores Externos**: Tab izquierdo
- **Proyectos Institucionales**: Tab derecho

### Cards de Estadísticas
- Visualización en tiempo real
- 4 métricas clave por sección
- Indicadores de tendencia (↑ ↓)

### Tablas Interactivas
- Ordenamiento por columnas
- Búsqueda y filtros (próximamente)
- Menú de acciones por fila (⋮)
- Diseño responsive

### Formularios Modales
- Validación en tiempo real
- Campos obligatorios marcados con *
- Mensajes de error claros
- Botones de cancelar/guardar

### Estados Visuales
- **Loading**: Spinner mientras carga datos
- **Empty State**: Mensaje cuando no hay datos
- **Error State**: Alertas rojas con detalles
- **Success**: Actualización automática tras acciones

---

## 🔄 Flujo de Trabajo Típico

### Escenario 1: Registrar un nuevo convenio universitario
```
1. Sidebar → "Proveedores y Proyectos"
2. Tab "Proveedores Externos"
3. "Nuevo Proveedor"
4. Completar:
   - Nombre: "Universidad Nacional"
   - Tipo: Universidad
   - Horas: 240
   - Contacto: Dr. Juan Pérez (opcional)
5. "Crear Proveedor"
✅ Proveedor creado - Ver estadísticas actualizadas
```

### Escenario 2: Crear proyecto de investigación
```
1. Sidebar → "Proveedores y Proyectos"
2. Tab "Proyectos Institucionales"
3. "Nuevo Proyecto"
4. Completar:
   - Código: INV-2025-001
   - Título: "Mejora de Infraestructura"
   - Tipo: Investigación
   - Horas Requeridas: 160
   - Fechas: 01/01/2025 - 31/12/2025
5. "Crear Proyecto"
✅ Proyecto creado - Ver barra de capacidad al 0%
```

### Escenario 3: Editar horas asignadas
```
1. Localizar proyecto en tabla
2. Clic en menú (⋮) → "Editar"
3. Modificar "Horas Asignadas": 120 (de 160 requeridas)
4. "Actualizar"
✅ Barra de capacidad ahora muestra 75% (amarillo)
```

---

## 💡 Tips y Mejores Prácticas

### ✅ DO (Hacer)
- Usa códigos descriptivos para proyectos (Ej. INV-2025-001)
- Completa la información de contacto en proveedores
- Revisa las estadísticas antes de crear nuevos elementos
- Usa fechas realistas para planificación

### ❌ DON'T (No Hacer)
- No uses códigos duplicados (validación automática)
- No asignes más horas de las requeridas sin justificación
- No elimines proveedores/proyectos con datos relacionados
- No olvides actualizar el estado cuando finalices proyectos

---

## 🐛 Troubleshooting

### ❓ No veo la opción en el sidebar
**Solución:**
1. Verifica que estés autenticado
2. Refresca la página (F5)
3. Verifica permisos de usuario

### ❓ Error al crear proveedor/proyecto
**Posibles causas:**
- Campos obligatorios vacíos
- Código de proyecto duplicado
- Backend no está corriendo
- Error de red

**Solución:**
1. Revisa mensajes de error (alerta roja)
2. Verifica que todos los campos con * estén completos
3. Comprueba consola del navegador (F12)

### ❓ Datos no se actualizan
**Solución:**
1. Usa botón "Actualizar" (↻)
2. Refresca la página
3. Verifica conexión con backend

### ❓ Estadísticas en 0
**Causa:** No hay datos registrados
**Solución:** Crea el primer proveedor/proyecto

---

## 🔐 Permisos Necesarios

Para usar este módulo necesitas:
- ✅ Usuario autenticado
- ✅ Acceso al módulo "Gestión de Tiempos de Jornada"
- ✅ (Futuro) Permisos específicos por rol

---

## 🚧 Próximas Funcionalidades

### En Desarrollo
- [ ] Filtros y búsqueda en tablas
- [ ] Paginación para grandes volúmenes
- [ ] Exportar a Excel/PDF
- [ ] Gestión de asignaciones de profesores
- [ ] Dashboard de tiempo disponible vs consumido
- [ ] Notificaciones automáticas
- [ ] Reportes y gráficos
- [ ] Historial de cambios

### Planeado
- [ ] Importación masiva desde CSV
- [ ] Integración con sistema de nómina
- [ ] Alertas cuando proyecto alcance capacidad
- [ ] Validación de conflictos de horario
- [ ] Calendario visual de proyectos

---

## 📞 Soporte

¿Problemas o sugerencias?
- Revisa la documentación técnica en `/apps/frontend/QUICK_START.md`
- Consulta logs de backend en consola
- Abre un issue en el repositorio

---

## ✨ Resumen Visual

```
📱 SIDEBAR (Izquierda)
   └─ 🕒 Gestión de Tiempos de Jornada
      ├─ Panel de Tiempos
      └─ ⭐ Proveedores y Proyectos
         │
         ├─ TAB: 🏢 Proveedores Externos
         │   ├─ 📊 Estadísticas (4 cards)
         │   ├─ 📋 Tabla interactiva
         │   └─ ➕ Nuevo Proveedor
         │
         └─ TAB: 💼 Proyectos Institucionales
             ├─ 📊 Estadísticas (4 cards)
             ├─ 📋 Tabla con barras de progreso
             └─ ➕ Nuevo Proyecto
```

---

**¡Listo para usar! 🚀**
