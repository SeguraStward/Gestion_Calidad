# Plan de Testing — Sistema de Gestión de Calidad (UNA)

> **Propósito**: Evidencia académica de pruebas unitarias y modulares para entrega del Capítulo V.  
> **Framework**: Jest 29 + NestJS Testing Module + TypeScript  
> **Ubicación de specs**: `apps/backend/test/src/`  
> **Skill de apoyo**: `/gestion-calidad-testing`

---

## Estrategia de Evidencia

Para cada fase se genera evidencia de tres tipos:

| Tipo | Cómo se genera | Qué demuestra |
|------|----------------|---------------|
| **Terminal output** | `pnpm test` imprime ✓/✗ con colores | Tests ejecutados en tiempo real |
| **Reporte JSON** | `--json --outputFile=test-results/fase-X.json` | Datos estructurados de cada test |
| **Reporte de cobertura** | `pnpm test:cov` genera `coverage/lcov-report/index.html` | Porcentaje de código cubierto |
| **Screenshot** | Captura de pantalla de la terminal al finalizar cada fase | Evidencia visual para el informe |

### Carpetas de salida
```
test-results/
  fase-1.json
  fase-2.json
  fase-3.json
  fase-4.json
  fase-5.json
coverage/
  lcov-report/
    index.html    ← abrir en navegador para screenshot de cobertura
```

---

## Clasificación de pruebas

- **Prueba Unitaria**: Prueba una sola clase/función con todas las dependencias mockeadas (jest.fn())
- **Prueba Modular**: Monta el módulo completo de NestJS y prueba la interacción Controller → Service → Repository (con repo mockeado)

---

## FASE 1 — Infraestructura Base y GenericController

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Verificar que el controlador genérico base funciona correctamente para todos los módulos que lo heredan.  
> **Estado**: ✅ Ya existe en `test/src/core/common/interfaces/generic.controller.spec.ts`

### Módulo cubierto
- `GenericController` — base de todos los controladores del sistema

### Tests a ejecutar
```bash
cd apps/backend
pnpm test --testPathPattern=generic.controller
pnpm test --testPathPattern=generic.controller -- --json --outputFile=../../test-results/fase-1.json
```

### Casos de prueba (ya implementados)
| # | Descripción | Tipo |
|---|-------------|------|
| 1 | `findAll` retorna registros paginados | Unitaria |
| 2 | `count` retorna el conteo correcto | Unitaria |
| 3 | `findById` retorna el registro por ID | Unitaria |
| 4 | `findById` lanza `NotFoundException` si no existe | Unitaria |
| 5 | `create` crea un nuevo registro | Unitaria |
| 6 | `update` actualiza un registro por ID | Unitaria |
| 7 | `delete` elimina un registro por ID | Unitaria |

### Evidencia esperada
```
PASS test/src/core/common/interfaces/generic.controller.spec.ts
  GenericController
    findAll
      ✓ should return paginated records
    count
      ✓ should return the count of records
    findById
      ✓ should return a record by id
      ✓ should throw NotFoundException if record not found
    create
      ✓ should create a new record
    update
      ✓ should update a record by id
    delete
      ✓ should delete a record by id

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

---

## FASE 2 — Módulos de Usuarios y Autenticación

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Verificar la lógica crítica de gestión de usuarios y autenticación JWT.  
> **Prioridad**: ALTA — son módulos transversales a todo el sistema

### Archivos a crear
- `test/src/modules/users/users.service.spec.ts`
- `test/src/modules/auth/auth.service.spec.ts`

### 2.1 — UsersService (Prueba Unitaria)

**Ruta**: `test/src/modules/users/users.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `updateProfile` | Limpia campos vacíos antes de actualizar |
| 2 | `updateProfile` | Solo actualiza campos con valores válidos |
| 3 | `setUserRoles` | Asigna roles válidos correctamente |
| 4 | `setUserRoles` | Lanza error si algún rol no existe |
| 5 | `setUserRoles` | Lanza error si algún rol está INACTIVE |
| 6 | `deleteById` | Elimina usuario con transacción (desconecta roles primero) |
| 7 | `deleteById` | Lanza error si usuario no existe |
| 8 | `bulkImportProfessors` | Crea usuarios nuevos correctamente |
| 9 | `bulkImportProfessors` | Actualiza usuario existente si ya existe por nationalId |
| 10 | `bulkImportProfessors` | Cuenta errores correctamente si datos incompletos |
| 11 | `findUsersByRoleNameAndStatus` | Filtra usuarios por rol y estado |
| 12 | `getUserActiveRolesWithPermissions` | Retorna array vacío si no tiene roles |

### 2.2 — AuthService (Prueba Unitaria)

**Ruta**: `test/src/modules/auth/auth.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `googleLogin` | Lanza `UnauthorizedException` si faltan datos de Google |
| 2 | `googleLogin` | Crea usuario nuevo con estado PRE_REGISTRATION si no existe |
| 3 | `googleLogin` | Retorna usuario existente si ya está registrado |
| 4 | `hashToken` (privado via spy) | Genera hash SHA-256 consistente |

### Comando de ejecución
```bash
cd apps/backend
pnpm test --testPathPattern="users.service|auth.service"
pnpm test --testPathPattern="users.service|auth.service" -- --json --outputFile=../../test-results/fase-2.json
```

---

## FASE 3 — Módulos Académicos Principales

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Verificar servicios con lógica custom en el dominio académico.

### Archivos a crear
- `test/src/modules/cohorts/cohorts.service.spec.ts`
- `test/src/modules/careers/careers.service.spec.ts`
- `test/src/modules/academic-cycles/academic-cycles.service.spec.ts`

### 3.1 — CohortsService (Prueba Unitaria)

**Ruta**: `test/src/modules/cohorts/cohorts.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `create` | Crea cohorte con estado ACTIVE por defecto |
| 2 | `create` | Respeta estado explícito si se provee |
| 3 | `findAll` | Llama a `findAllWithCareer` del repositorio |
| 4 | `findByCareer` | Filtra cohortes por careerId |
| 5 | `findById` | Retorna cohorte por ID |
| 6 | `update` | Actualiza cohorte correctamente |
| 7 | `delete` | Elimina cohorte por ID |

### 3.2 — CareersService (Prueba Unitaria)

**Ruta**: `test/src/modules/careers/careers.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `deleteById` | Lanza `BadRequestException` si carrera tiene cursos activos |
| 2 | `deleteById` | Lanza `BadRequestException` si carrera tiene proyectos activos |
| 3 | `deleteById` | Elimina si no tiene relaciones activas |
| 4 | `findById` | Retorna null si no existe |
| 5 | `findAll` | Retorna paginación correcta |

### 3.3 — AcademicCyclesService (Prueba Unitaria)

**Ruta**: `test/src/modules/academic-cycles/academic-cycles.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `findAll` | Retorna ciclos paginados |
| 2 | `save` | Crea ciclo académico correctamente |
| 3 | `deleteById` | Lanza error si tiene relaciones activas |

### Comando de ejecución
```bash
cd apps/backend
pnpm test --testPathPattern="cohorts.service|careers.service|academic-cycles.service"
pnpm test --testPathPattern="cohorts.service|careers.service|academic-cycles.service" -- --json --outputFile=../../test-results/fase-3.json
```

---

## FASE 4 — Módulos de Acreditación y Estándares

> **Tipo**: Prueba Unitaria  
> **Objetivo**: Verificar lógica de acreditación SINAES, incluyendo validaciones de unicidad.

### Archivos a crear
- `test/src/modules/standards/standards.service.spec.ts`
- `test/src/modules/commissions/commissions.service.spec.ts`
- `test/src/modules/projects/projects.service.spec.ts`

### 4.1 — StandardsService (Prueba Unitaria)

**Ruta**: `test/src/modules/standards/standards.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `save` | Lanza `ConflictException` si ya existe un estándar con ese nombre |
| 2 | `save` | Crea estándar si el nombre es único |
| 3 | `deleteById` | Lanza `BadRequestException` si tiene evidencias activas |
| 4 | `deleteById` | Elimina si no tiene relaciones activas |
| 5 | `findAll` | Retorna estándares paginados |

### 4.2 — CommissionsService (Prueba Unitaria)

**Ruta**: `test/src/modules/commissions/commissions.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `deleteById` | Lanza error si tiene proyectos activos |
| 2 | `deleteById` | Lanza error si tiene revisiones activas |
| 3 | `deleteById` | Lanza error si tiene sesiones activas |
| 4 | `deleteById` | Lanza error si tiene miembros activos |
| 5 | `deleteById` | Elimina si todas las relaciones son INACTIVE |
| 6 | `findAll` | Retorna comisiones paginadas |

### 4.3 — ProjectsService (Prueba Unitaria)

**Ruta**: `test/src/modules/projects/projects.service.spec.ts`

| # | Método | Caso de prueba |
|---|--------|----------------|
| 1 | `deleteById` | Lanza `BadRequestException` si tiene documentos activos |
| 2 | `deleteById` | Lanza `BadRequestException` si tiene revisiones activas |
| 3 | `deleteById` | Elimina si no tiene relaciones activas |
| 4 | `save` | Crea proyecto y valida DTO |
| 5 | `update` | Actualiza proyecto correctamente |

### Comando de ejecución
```bash
cd apps/backend
pnpm test --testPathPattern="standards.service|commissions.service|projects.service"
pnpm test --testPathPattern="standards.service|commissions.service|projects.service" -- --json --outputFile=../../test-results/fase-4.json
```

---

## FASE 5 — Pruebas Modulares (Interacción entre Módulos)

> **Tipo**: Prueba Modular  
> **Objetivo**: Demostrar que Controller → Service → Repository trabajan juntos correctamente.  
> **Esta es la evidencia clave para "Pruebas Modulares (20 puntos)"**

### Archivos a crear
- `test/src/modules/cohorts/cohorts.module.spec.ts`
- `test/src/modules/projects/projects.module.spec.ts`
- `test/src/modules/users/users.module.spec.ts`

### 5.1 — Módulo Cohorts (Prueba Modular)

**Ruta**: `test/src/modules/cohorts/cohorts.module.spec.ts`

Monta `CohortsModule` completo con `CohortsRepository` mockeado. Prueba el flujo HTTP completo:

| # | Endpoint | Caso de prueba | Flujo |
|---|----------|----------------|-------|
| 1 | `POST /cohorts` | Crea cohorte — responde 201 | Controller → Service → Repo.save |
| 2 | `GET /cohorts` | Lista cohortes — responde 200 | Controller → Service → Repo.findAllWithCareer |
| 3 | `GET /cohorts/:id` | Obtiene por ID — responde 200 | Controller → Service → Repo.findById |
| 4 | `GET /cohorts/:id` | ID inexistente — responde 404 | Controller → Service → NotFoundException |
| 5 | `PATCH /cohorts/:id` | Actualiza — responde 200 | Controller → Service → Repo.update |
| 6 | `DELETE /cohorts/:id` | Elimina — responde 200 | Controller → Service → Repo.deleteById |

### 5.2 — Módulo Projects (Prueba Modular)

**Ruta**: `test/src/modules/projects/projects.module.spec.ts`

Monta `ProjectsModule` con repositorio mockeado. Prueba protección de relaciones:

| # | Endpoint | Caso de prueba | Flujo |
|---|----------|----------------|-------|
| 1 | `POST /projects` | Crea proyecto — responde 201 | Controller → Service → Repo.save → DtoValidator |
| 2 | `GET /projects` | Lista con paginación — responde 200 | Controller → Service → Repo.findAll |
| 3 | `DELETE /projects/:id` | Intenta eliminar con docs activos — responde 400 | Controller → Service → BadRequestException |
| 4 | `DELETE /projects/:id` | Elimina sin relaciones — responde 200 | Controller → Service → Repo.deleteById |

### 5.3 — Módulo Users (Prueba Modular)

**Ruta**: `test/src/modules/users/users.module.spec.ts`

Monta `UsersModule` con Prisma mockeado. Prueba flujos de gestión de usuarios:

| # | Endpoint | Caso de prueba | Flujo |
|---|----------|----------------|-------|
| 1 | `GET /users` | Lista usuarios — responde 200 | Controller → Service → Repo.findAll |
| 2 | `PATCH /users/:id` | Actualiza perfil limpiando campos vacíos | Controller → Service → Prisma.update |
| 3 | `DELETE /users/:id` | Elimina con transacción — responde 200 | Controller → Service → Prisma.$transaction |
| 4 | `GET /users/:id` | Usuario no encontrado — responde 404 | Controller → Service → NotFoundException |

### Comando de ejecución
```bash
cd apps/backend
pnpm test --testPathPattern="cohorts.module|projects.module|users.module"
pnpm test --testPathPattern="cohorts.module|projects.module|users.module" -- --json --outputFile=../../test-results/fase-5.json
```

---

## FASE 6 — Cobertura Total y Reporte Final

> **Tipo**: Reporte de evidencia final  
> **Objetivo**: Generar reporte de cobertura completo para adjuntar al informe académico.

### Comando
```bash
cd apps/backend
pnpm test:cov
```

### Qué revisar en el reporte
Abrir `apps/backend/test/coverage/lcov-report/index.html` en el navegador. Tomar screenshot de:
1. Resumen de cobertura por módulo (% Statements, % Branches, % Functions)
2. Detalle de líneas cubiertas en `generic.service.ts`
3. Detalle de líneas cubiertas en un servicio custom (e.g. `cohorts.service.ts`)

---

## Resumen de evidencias por entregable académico

| Entregable | Fase(s) | Tipo de evidencia |
|------------|---------|-------------------|
| **Pruebas Unitarias (15 pts)** | Fases 1, 2, 3, 4 | Screenshots de terminal con ✓, archivos .spec.ts |
| **Pruebas Modulares (20 pts)** | Fase 5 | Screenshots mostrando flujo Controller→Service→Repo |
| **Cobertura de código** | Fase 6 | Screenshot de HTML coverage report |

---

## Checklist de ejecución

- [ ] Fase 1 — GenericController (ya existe, ejecutar y capturar)
- [ ] Fase 2 — Users + Auth (crear specs, ejecutar, capturar)
- [ ] Fase 3 — Cohorts + Careers + AcademicCycles (crear specs, ejecutar, capturar)
- [ ] Fase 4 — Standards + Commissions + Projects (crear specs, ejecutar, capturar)
- [ ] Fase 5 — Pruebas Modulares x3 (crear specs, ejecutar, capturar)
- [ ] Fase 6 — Coverage HTML (ejecutar, abrir navegador, capturar)

---

## Guía para capturas de pantalla (evidencia)

1. **Fondo oscuro**: usa la terminal con tema oscuro para que los ✓ verdes resalten
2. **Zoom 100%**: no hagas zoom para que se vean todos los test cases
3. **Capturar siempre**: el resumen final de Jest (`Test Suites: X passed, Tests: Y passed`)
4. **Nombrar archivos**: `evidencia-fase-1.png`, `evidencia-fase-2.png`, etc.
5. **Para módulos**: captura el output completo del módulo incluyendo el nombre de cada `describe` block

---

> Usa `/gestion-calidad-testing` para activar el modo experto y ejecutar cada fase automáticamente.
