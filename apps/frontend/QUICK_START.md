# 🚀 Guía de Uso - Módulo de Proveedores Externos y Proyectos Institucionales

## 📍 URLs de Acceso

### Frontend
- **Gestión de Extensiones:** http://localhost:3001/times-management/extensions
- **Gestión de Tiempos (Original):** http://localhost:3001/times-management

### Backend API
- **Base URL:** http://localhost:3000/api
- **Documentación Swagger:** http://localhost:3000/api/docs (si está configurada)

---

## 🎯 Funcionalidades Implementadas

### 1️⃣ **Proveedores Externos**
Gestión de universidades, convenios y acuerdos que proveen horas de jornada adicionales.

**Características:**
- ✅ Crear, editar, eliminar proveedores
- ✅ Tipos: Universidad, Convenio, Intercambio, Otro
- ✅ Información de contacto completa
- ✅ Horas provistas (fijas o variables)
- ✅ Estados: Activo, Inactivo, Pendiente, Completado
- ✅ Estadísticas en tiempo real

**Flujo de Uso:**
1. Acceder a la pestaña "Proveedores Externos"
2. Clic en "Nuevo Proveedor"
3. Completar el formulario:
   - Nombre (obligatorio)
   - Tipo de proveedor
   - Horas provistas
   - Información de contacto (opcional)
   - Fechas de inicio/fin (opcional)
4. Guardar

**Acciones Disponibles:**
- Ver detalles
- Editar información
- Eliminar (con confirmación)
- Actualizar lista

---

### 2️⃣ **Proyectos Institucionales**
Gestión de proyectos que requieren asignación de tiempo de jornada de profesores.

**Características:**
- ✅ Crear, editar, eliminar proyectos
- ✅ Código único de proyecto
- ✅ Tipos: Institucional, Investigación, Extensión, Otro
- ✅ Horas requeridas vs asignadas
- ✅ Cálculo automático de capacidad (%)
- ✅ Director asignado
- ✅ Estados: Borrador, Activo, Pausado, Completado, Cancelado
- ✅ Barra de progreso visual

**Flujo de Uso:**
1. Acceder a la pestaña "Proyectos Institucionales"
2. Clic en "Nuevo Proyecto"
3. Completar el formulario:
   - Código único (obligatorio, no editable después)
   - Título y descripción
   - Tipo de proyecto
   - Horas requeridas (obligatorio)
   - Horas asignadas (opcional, default 0)
   - Fechas de inicio/fin (obligatorias)
4. Guardar

**Acciones Disponibles:**
- Ver detalles
- Gestionar asignaciones (próximamente)
- Editar información
- Eliminar (con confirmación)
- Actualizar lista

---

## 📊 Estadísticas en Tiempo Real

### Proveedores Externos
- Total de proveedores
- Horas totales provistas
- Proveedores activos

### Proyectos Institucionales
- Total de proyectos
- Proyectos activos
- Horas requeridas totales
- Horas asignadas totales
- Capacidad promedio

---

## 🧪 Pruebas Rápidas

### Crear un Proveedor Externo
```bash
# Método: POST
# URL: http://localhost:3000/api/external-providers
# Body (JSON):
{
  "name": "Universidad de Costa Rica",
  "description": "Convenio de intercambio académico",
  "providerType": "UNIVERSITY",
  "contactEmail": "contacto@ucr.ac.cr",
  "contactPerson": "Dr. Juan Pérez",
  "providedJourneyTime": 120,
  "annualAllocationId": "mock-annual-2025",
  "isFixedTime": true
}
```

### Crear un Proyecto Institucional
```bash
# Método: POST
# URL: http://localhost:3000/api/institutional-projects
# Body (JSON):
{
  "code": "PROJ-2025-001",
  "title": "Mejora de Infraestructura Tecnológica",
  "description": "Proyecto de actualización de laboratorios",
  "projectType": "INSTITUTIONAL",
  "requiredJourneyTime": 160,
  "assignedJourneyTime": 80,
  "startDate": "2025-01-15",
  "endDate": "2025-12-31",
  "campusAllocationId": "mock-campus-brunca",
  "directorId": "mock-director-001"
}
```

### Listar Proveedores
```bash
# Método: GET
# URL: http://localhost:3000/api/external-providers
```

### Listar Proyectos
```bash
# Método: GET
# URL: http://localhost:3000/api/institutional-projects
```

---

## 🎨 Componentes Creados

### Services
- `external-providers.service.ts` - 7 métodos API
- `institutional-projects.service.ts` - 9 métodos API

### Stores (Zustand)
- `useExternalProvidersStore.ts` - Estado y acciones
- `useInstitutionalProjectsStore.ts` - Estado y acciones

### Components
- `ExternalProvidersTable.tsx` - Tabla con acciones
- `ExternalProviderForm.tsx` - Formulario de creación/edición
- `InstitutionalProjectsTable.tsx` - Tabla con capacidad visual
- `InstitutionalProjectForm.tsx` - Formulario de creación/edición

### Pages
- `times-extensions.tsx` - Página principal integrada

---

## 🔧 Endpoints Backend

### External Providers (7 endpoints)
1. `POST /api/external-providers` - Crear proveedor
2. `GET /api/external-providers` - Listar todos
3. `GET /api/external-providers/:id` - Obtener uno
4. `PUT /api/external-providers/:id` - Actualizar
5. `DELETE /api/external-providers/:id` - Eliminar
6. `GET /api/external-providers/by-annual-allocation/:id` - Por año
7. `GET /api/external-providers/total-provided-time/:id` - Total horas

### Institutional Projects (9 endpoints)
1. `POST /api/institutional-projects` - Crear proyecto
2. `GET /api/institutional-projects` - Listar todos
3. `GET /api/institutional-projects/:id` - Obtener uno
4. `PUT /api/institutional-projects/:id` - Actualizar
5. `DELETE /api/institutional-projects/:id` - Eliminar
6. `GET /api/institutional-projects/by-campus-allocation/:id` - Por campus
7. `GET /api/institutional-projects/by-director/:id` - Por director
8. `GET /api/institutional-projects/total-assigned-time/:id` - Total asignado
9. `GET /api/institutional-projects/with-available-time` - Con tiempo disponible

---

## ✅ Checklist de Pruebas

- [ ] Crear un proveedor externo desde la UI
- [ ] Editar un proveedor existente
- [ ] Eliminar un proveedor (con confirmación)
- [ ] Ver estadísticas de proveedores actualizarse
- [ ] Crear un proyecto institucional desde la UI
- [ ] Editar un proyecto existente
- [ ] Verificar barra de capacidad (requerido vs asignado)
- [ ] Eliminar un proyecto (con confirmación)
- [ ] Actualizar listas con el botón "Actualizar"
- [ ] Verificar que los errores se muestren correctamente
- [ ] Cambiar entre pestañas (Proveedores / Proyectos)

---

## 🐛 Troubleshooting

### Frontend no conecta con Backend
- Verificar que `NEXT_PUBLIC_API_URL` esté configurado en `.env`
- Por defecto usa: `http://localhost:3000/api/v1`

### Error al crear proveedor/proyecto
- Verificar que los IDs mock estén correctos
- Revisar la consola del navegador para mensajes de error
- Revisar la consola del backend para stack traces

### Tabla vacía
- Verificar que el backend esté respondiendo
- Abrir DevTools > Network para ver las peticiones
- Revisar la consola para errores de fetch

---

## 🚀 Próximos Pasos Sugeridos

1. **Integrar con datos reales:**
   - Reemplazar `MOCK_ANNUAL_ALLOCATION_ID` con datos de API
   - Reemplazar `MOCK_CAMPUS_ALLOCATION_ID` con selección de campus
   - Reemplazar `MOCK_DIRECTOR_ID` con selección de profesores

2. **Mejorar UI:**
   - Agregar filtros y búsqueda
   - Implementar paginación
   - Agregar exportación a Excel/PDF

3. **Funcionalidades Avanzadas:**
   - Gestión de asignaciones de profesores a proyectos
   - Dashboard de tiempo disponible vs consumido
   - Reportes y gráficos
   - Notificaciones cuando un proyecto alcance capacidad

4. **Validaciones:**
   - Verificar que fechas de fin > fechas de inicio
   - Alertas cuando horas asignadas > requeridas
   - Validación de códigos de proyecto únicos

---

## 📝 Resumen de Archivos Creados

**Backend (22 archivos - Ya existentes):**
- 7 archivos External Providers
- 7 archivos Institutional Projects
- 8 archivos modificados (controllers, services, repositories)

**Frontend (10 archivos nuevos):**
- 2 servicios
- 2 stores Zustand
- 4 componentes
- 1 página
- 1 ruta Next.js

**Total:** 32 archivos en el módulo completo

---

## 🎉 ¡Listo para Probar!

1. **Backend:** http://localhost:3000 ✅ RUNNING
2. **Frontend:** http://localhost:3001 ✅ RUNNING
3. **Página del módulo:** http://localhost:3001/times-management/extensions

**¡Todo funcionando! Procedamos a probar en el navegador** 🚀
