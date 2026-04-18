# Capítulo V: Pruebas — Sistema de Gestión de Calidad (UNA)

---

## PRUEBAS UNITARIAS
> Responsable: **Ángel Segura Méndez**

---

### CP-U-001

| **ID** | CP-U-001 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Autenticación Google — credenciales faltantes lanzan UnauthorizedException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `AuthService` instanciado con mocks de `PrismaService` y `JwtService`

**Datos de Prueba:**
- `email`: vacío / `googleId`: vacío

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `googleLogin({ email: '', googleId: '' })` | El servicio valida campos obligatorios |
| 2. Verificar que no consulta la BD | No se llama a `prisma.user.findFirst` |
| 3. Verificar excepción | Se lanza `UnauthorizedException` |

**Resultado Obtenido:** El test `debe lanzar UnauthorizedException si faltan email o googleId` pasa. El servicio valida campos obligatorios antes de consultar la base de datos.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-002

| **ID** | CP-U-002 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Autenticación Google — usuario nuevo se crea con estado PRE_REGISTRATION |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- No existe usuario con el `googleId` en la base de datos mock

**Datos de Prueba:**
- `email`: `nuevo@una.cr`, `googleId`: `google-123`, `fullName`: `Usuario Nuevo`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `googleLogin({ email, googleId, fullName })` | Servicio busca usuario por `googleId` |
| 2. `prisma.user.findFirst` retorna `null` | Se detecta usuario nuevo |
| 3. Verificar llamada a `prisma.user.create` | Se crea con `status: PRE_REGISTRATION` |
| 4. Verificar respuesta | Retorna `{ needsProfileCompletion: true }` sin tokens |

**Resultado Obtenido:** El test `debe crear un usuario nuevo con estado PRE_REGISTRATION` pasa. El servicio crea el usuario con estado de pre-registro y no emite tokens JWT.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-003

| **ID** | CP-U-003 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Autenticación Google — usuario INACTIVE lanza UnauthorizedException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Existe usuario con `status: INACTIVE` en la BD mock

**Datos de Prueba:**
- `email`: `inactivo@una.cr`, `googleId`: `google-inactive`, `status BD`: `INACTIVE`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `googleLogin({ email, googleId })` | Servicio busca y encuentra usuario |
| 2. El mock retorna usuario con `status: INACTIVE` | Servicio evalúa estado |
| 3. Verificar excepción | Se lanza `UnauthorizedException` |
| 4. Verificar que no se emiten tokens | No se llama a `jwtService.sign` |

**Resultado Obtenido:** El test `debe lanzar UnauthorizedException para usuarios INACTIVE` pasa. El acceso es bloqueado para cuentas inactivas.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-004

| **ID** | CP-U-004 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Autenticación Google — usuario ACTIVE recibe tokens y needsProfileCompletion=false |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Existe usuario con `status: ACTIVE` en la BD mock

**Datos de Prueba:**
- `email`: `activo@una.cr`, `googleId`: `google-active`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `googleLogin({ email, googleId })` | Servicio encuentra usuario activo |
| 2. Verificar generación de tokens | `jwtService.sign` es llamado |
| 3. Verificar respuesta | `{ needsProfileCompletion: false, accessToken, refreshToken }` |

**Resultado Obtenido:** El test `debe retornar tokens y needsProfileCompletion=false para usuarios ACTIVE` pasa correctamente.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-005

| **ID** | CP-U-005 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Refresh token — ciclo completo de renovación |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Existe refresh token activo (`isUsed: false`) en BD mock

**Datos de Prueba:**
- `refreshToken`: `raw-refresh-token`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `refreshTokens('raw-refresh-token')` | Servicio verifica token en BD |
| 2. `updateMany` marca el token como usado | `isUsed: true` |
| 3. Se generan nuevos tokens | Par `accessToken` + `refreshToken` fresco |
| 4. Nuevo refresh token persiste en BD | Hash guardado correctamente |

**Resultado Obtenido:** El test `debe marcar el refresh token como usado y emitir un nuevo par de tokens` pasa. La rotación de tokens funciona correctamente previniendo reutilización.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-006

| **ID** | CP-U-006 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | Revocar token — token ya revocado se omite sin error |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Token ya fue previamente revocado en la BD

**Datos de Prueba:**
- `refreshToken`: `already-revoked-token`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `revokeRefreshToken('already-revoked-token')` | Servicio busca el token |
| 2. El mock retorna token con `isRevoked: true` | Detección de token revocado |
| 3. Verificar que no se actualiza BD | `prisma.refreshToken.update` no es llamado |
| 4. Verificar que no lanza excepción | Operación idempotente |

**Resultado Obtenido:** El test `debe omitir la operación si el token ya fue revocado` pasa. La revocación es idempotente y segura.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-007

| **ID** | CP-U-007 | **Fecha** | 08/04/2026 | **Módulo** | AuthService |
|---|---|---|---|---|---|
| **Nombre** | setActiveRole — lanza UnauthorizedException si el usuario no tiene el rol |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Usuario existe en BD con roles `['COORDINADOR']`

**Datos de Prueba:**
- `userId`: `u1`, `roleName`: `ADMIN`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `setActiveRole('u1', 'ADMIN')` | Servicio busca usuario con sus roles |
| 2. El rol `ADMIN` no está entre los roles del usuario | Detección de rol inválido |
| 3. Verificar excepción | Se lanza `UnauthorizedException` |

**Resultado Obtenido:** El test `debe lanzar UnauthorizedException si el usuario no tiene el rol` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-008

| **ID** | CP-U-008 | **Fecha** | 08/04/2026 | **Módulo** | UsersService |
|---|---|---|---|---|---|
| **Nombre** | updateProfile — campos vacíos o nulos son ignorados |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `UsersService` instanciado con mocks, usuario `u1` existe

**Datos de Prueba:**
- `payload`: `{ fullName: '', email: null, nationalId: '12345' }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `updateProfile('u1', payload)` | Servicio procesa el payload |
| 2. `fullName: ''` — campo vacío | Omitido del update |
| 3. `email: null` — campo nulo | Omitido del update |
| 4. `nationalId: '12345'` — valor real | Incluido en el update |

**Resultado Obtenido:** El test `debe ignorar campos vacíos o nulos` pasa. Evita sobrescrituras accidentales de datos en producción.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-009

| **ID** | CP-U-009 | **Fecha** | 08/04/2026 | **Módulo** | UsersService |
|---|---|---|---|---|---|
| **Nombre** | setUserRoles — roleId inexistente lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Solo existe el rol `r1` en BD mock

**Datos de Prueba:**
- `userId`: `u1`, `roleIds`: `['r1', 'r2-inexistente']`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `setUserRoles('u1', ['r1', 'r2-inexistente'])` | Servicio consulta roles existentes |
| 2. `r2-inexistente` no está en BD | Detección de ID inválido |
| 3. Verificar excepción | Se lanza `BadRequestException` |
| 4. Verificar mensaje | Indica roles no existen o no están activos |

**Resultado Obtenido:** El test `debe lanzar error si algún roleId no existe o está inactivo` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-010

| **ID** | CP-U-010 | **Fecha** | 08/04/2026 | **Módulo** | UsersService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — ejecuta transacción completa y retorna true |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Usuario `u1` existe en BD mock

**Datos de Prueba:**
- `userId`: `u1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('u1')` | Servicio inicia transacción Prisma |
| 2. Verificar transacción | `prisma.$transaction` es llamado |
| 3. Verificar eliminación | Usuario removido dentro de la transacción |
| 4. Verificar retorno | Retorna `true` |

**Resultado Obtenido:** El test `debe ejecutar la transacción completa y retornar true` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-011

| **ID** | CP-U-011 | **Fecha** | 08/04/2026 | **Módulo** | UsersService |
|---|---|---|---|---|---|
| **Nombre** | bulkImportProfessors — omite usuarios que ya tienen el rol PROFESOR |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Usuario `cedula: '222'` ya existe con rol PROFESOR en BD mock

**Datos de Prueba:**
- `[{ cedula: '111', nombre: 'Nuevo' }, { cedula: '222', nombre: 'Existente' }]`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `bulkImportProfessors(data)` | Servicio procesa cada registro |
| 2. Para `cedula: '111'` — no existe | Se crea usuario nuevo con rol PROFESOR |
| 3. Para `cedula: '222'` — ya tiene rol PROFESOR | Se omite sin error |
| 4. Verificar conteos | `created: 1`, `skipped: 1` |

**Resultado Obtenido:** El test `debe omitir usuario existente que ya tiene el rol PROFESOR` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-012

| **ID** | CP-U-012 | **Fecha** | 08/04/2026 | **Módulo** | StandardsService |
|---|---|---|---|---|---|
| **Nombre** | save — nombre duplicado lanza ConflictException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.existsByName` retorna `true`

**Datos de Prueba:**
- `name`: `Estándar Existente`, `criterionId`: `crit-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ name: 'Estándar Existente', criterionId: 'crit-1' })` | Servicio verifica existencia por nombre |
| 2. `repo.existsByName` retorna `true` | Duplicado detectado |
| 3. Verificar excepción | Se lanza `ConflictException` |
| 4. Verificar que `repo.save` no fue llamado | No se persiste el duplicado |

**Resultado Obtenido:** El test `debe lanzar ConflictException si el nombre ya existe` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-013

| **ID** | CP-U-013 | **Fecha** | 08/04/2026 | **Módulo** | StandardsService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con evidencias activas lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` para relación `evidences` con status ACTIVE

**Datos de Prueba:**
- `id`: `std-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('std-1')` | Servicio verifica relaciones activas |
| 2. `repo.count` retorna `1` para evidencias | Relación activa detectada |
| 3. Verificar excepción | Se lanza `BadRequestException` |
| 4. Verificar que `repo.deleteById` no fue llamado | Registro no eliminado |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si tiene evidences activas` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-014

| **ID** | CP-U-014 | **Fecha** | 08/04/2026 | **Módulo** | CareersService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con cursos activos lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` para relación `courses` con status ACTIVE

**Datos de Prueba:**
- `id`: `career-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('career-1')` | Servicio verifica relaciones activas |
| 2. `repo.count` retorna `1` para cursos | Relación activa detectada |
| 3. Verificar excepción | Se lanza `BadRequestException` |
| 4. Verificar que `repo.deleteById` no fue llamado | Carrera no eliminada |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si la carrera tiene cursos activos` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-015

| **ID** | CP-U-015 | **Fecha** | 08/04/2026 | **Módulo** | CareersService |
|---|---|---|---|---|---|
| **Nombre** | softDeleteById — permite inactivar si relaciones están todas INACTIVE |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `0` para todas las relaciones activas

**Datos de Prueba:**
- `id`: `career-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `softDeleteById('career-1')` | Servicio verifica relaciones activas |
| 2. `repo.count` retorna `0` para cursos y proyectos | Sin relaciones activas |
| 3. Verificar llamada al repositorio | `repo.softDeleteById` es llamado |
| 4. Verificar estado resultado | Carrera marcada como `INACTIVE` |

**Resultado Obtenido:** El test `debe marcar la carrera como INACTIVE si no tiene relaciones activas` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-016

| **ID** | CP-U-016 | **Fecha** | 08/04/2026 | **Módulo** | CommissionsService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con proyectos activos lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` para relación `projects` ACTIVE

**Datos de Prueba:**
- `id`: `comm-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('comm-1')` | Servicio verifica `relationCheckConfig` |
| 2. `repo.count` retorna `1` | Relación activa encontrada |
| 3. Verificar excepción | Se lanza `BadRequestException` |
| 4. Verificar que no se elimina | `repo.deleteById` no llamado |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si tiene projects activos` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-017

| **ID** | CP-U-017 | **Fecha** | 08/04/2026 | **Módulo** | CommissionsService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con miembros activos lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` para relación `members` ACTIVE

**Datos de Prueba:**
- `id`: `comm-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('comm-1')` | Servicio evalúa los 4 `relationFields` |
| 2. Solo `members` tiene conteo `1` | Relación activa detectada |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si tiene members activos` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-018

| **ID** | CP-U-018 | **Fecha** | 08/04/2026 | **Módulo** | ProjectsService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con documentos y reviews activos lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` tanto para `documents` como para `reviews` ACTIVE

**Datos de Prueba:**
- `id`: `proj-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('proj-1')` | Servicio verifica ambas relaciones |
| 2. Ambos `documents` y `reviews` tienen conteo `1` | Múltiples relaciones activas |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si tiene ambas relaciones activas` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-019

| **ID** | CP-U-019 | **Fecha** | 08/04/2026 | **Módulo** | AcademicCyclesService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — con cargas académicas activas lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `1` para `academicLoads` ACTIVE

**Datos de Prueba:**
- `id`: `cycle-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('cycle-1')` | Servicio verifica relaciones |
| 2. `academicLoads` tiene conteo `1` | Relación activa detectada |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si el ciclo tiene cargas académicas activas` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-020

| **ID** | CP-U-020 | **Fecha** | 08/04/2026 | **Módulo** | AcademicCyclesService |
|---|---|---|---|---|---|
| **Nombre** | save — crea y retorna el ciclo académico |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.save` retorna el ciclo creado con `id`

**Datos de Prueba:**
- `name`: `I-2024`, `year`: `2024`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ name: 'I-2024', year: 2024 })` | Servicio valida y delega al repo |
| 2. `repo.save` persiste el registro | Ciclo almacenado en BD |
| 3. Verificar retorno | Retorna objeto con `id` generado |

**Resultado Obtenido:** El test `debe guardar y retornar el ciclo creado` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-021

| **ID** | CP-U-021 | **Fecha** | 08/04/2026 | **Módulo** | CohortsService |
|---|---|---|---|---|---|
| **Nombre** | save — usa status ACTIVE por defecto si no se proporciona |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.save` está mockeado con respuesta válida

**Datos de Prueba:**
- `{ name: '2024-A', careerId: 'career-1' }` (sin status)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save(dto)` sin campo `status` | Servicio aplica default |
| 2. Verificar payload enviado al repo | `status: 'ACTIVE'` incluido |
| 3. Verificar retorno | Cohorte creada correctamente |

**Resultado Obtenido:** El test `debe usar status ACTIVE por defecto si no se proporciona` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-022

| **ID** | CP-U-022 | **Fecha** | 08/04/2026 | **Módulo** | CohortsService |
|---|---|---|---|---|---|
| **Nombre** | findById — lanza NotFoundException si la cohorte no existe |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findById` retorna `null`

**Datos de Prueba:**
- `id`: `no-existe`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `findById('no-existe')` | Servicio busca en repositorio |
| 2. Repositorio retorna `null` | Cohorte no encontrada |
| 3. Verificar excepción | Se lanza `NotFoundException` |

**Resultado Obtenido:** El test `debe lanzar NotFoundException si la cohorte no existe` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-023

| **ID** | CP-U-023 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService |
|---|---|---|---|---|---|
| **Nombre** | save — calcula availableSeats = maximumCapacity - enrolledCapacity |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Mocks de repositorio y `PrismaService` configurados

**Datos de Prueba:**
- `maximumCapacity`: `30`, `enrolledCapacity`: `20`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save(payload)` con capacidades | Servicio calcula seats disponibles |
| 2. Verificar cálculo `30 - 20 = 10` | `availableSeats: 10` en payload |
| 3. Verificar llamada a `repo.save` | Llamado con `availableSeats: 10` |

**Resultado Obtenido:** El test `debe calcular availableSeats y crear la carga` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-024

| **ID** | CP-U-024 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService |
|---|---|---|---|---|---|
| **Nombre** | save — fecha string YYYY-MM-DD se convierte a objeto Date |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Mocks configurados

**Datos de Prueba:**
- `date`: `'2024-06-01'`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, date: '2024-06-01' })` | Servicio procesa la fecha |
| 2. Se agrega `T00:00:00.000Z` | Fecha completa formada |
| 3. Verificar llamada a `repo.save` | `date` es instancia de `Date` |

**Resultado Obtenido:** El test `debe parsear fecha string YYYY-MM-DD correctamente` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-025

| **ID** | CP-U-025 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService |
|---|---|---|---|---|---|
| **Nombre** | save — fecha inválida no se incluye en el payload |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Mocks configurados

**Datos de Prueba:**
- `date`: `'not-a-date'`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, date: 'not-a-date' })` | Servicio intenta parsear |
| 2. `isNaN(tempDate.getTime())` resulta `true` | Fecha inválida detectada |
| 3. Verificar payload enviado | `date` es `undefined` |

**Resultado Obtenido:** El test `debe manejar fecha inválida (Invalid Date) sin incluirla` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-026

| **ID** | CP-U-026 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService |
|---|---|---|---|---|---|
| **Nombre** | delete — lanza Error si el registro no existe |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findById` retorna `null`

**Datos de Prueba:**
- `id`: `no-existe`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `delete('no-existe')` | Servicio busca el registro |
| 2. `findById` retorna `null` | No existe el registro |
| 3. Verificar excepción | Se lanza `Error` con mensaje descriptivo |
| 4. Verificar que no se elimina | `repo.deleteById` no llamado |

**Resultado Obtenido:** El test `debe lanzar Error si el registro no existe` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-027

| **ID** | CP-U-027 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService — bulkImport |
|---|---|---|---|---|---|
| **Nombre** | bulkImportAcademicLoads — campus no encontrado registra error |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `prisma.campus.findFirst` retorna `null`

**Datos de Prueba:**
- `campus`: `'Campus Inexistente'`, `nrc`: `'NRC-100'`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `bulkImportAcademicLoads([load])` | Servicio busca el campus |
| 2. `campus.findFirst` retorna `null` | Campus no encontrado |
| 3. Verificar contadores | `errors: 1`, `created: 0` |
| 4. Verificar mensaje de error | Contiene `'Campus'` y nombre del campus |

**Resultado Obtenido:** El test `debe registrar error si campus no se encuentra` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-028

| **ID** | CP-U-028 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService — bulkImport |
|---|---|---|---|---|---|
| **Nombre** | bulkImportAcademicLoads — actualiza carga existente por NRC |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Camino feliz configurado, `prisma.academicLoad.findFirst` retorna `{ id: 'al-existing' }`

**Datos de Prueba:**
- `nrc`: `'NRC-100'` (ya existe en BD)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `bulkImportAcademicLoads([load])` | Servicio resuelve todos los lookups |
| 2. `academicLoad.findFirst` retorna carga existente | Flujo de actualización |
| 3. `academicLoad.update` es llamado | Carga actualizada |
| 4. Verificar contadores | `updated: 1`, `created: 0` |

**Resultado Obtenido:** El test `debe actualizar carga existente por NRC` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-029

| **ID** | CP-U-029 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorAssignmentsService |
|---|---|---|---|---|---|
| **Nombre** | save — professorId vacío lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Mocks configurados

**Datos de Prueba:**
- `professorId`: `''` (vacío)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, professorId: '' })` | Servicio valida campo |
| 2. `!payload.professorId?.trim()` resulta `true` | Campo vacío detectado |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si professorId falta` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-030

| **ID** | CP-U-030 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorAssignmentsService |
|---|---|---|---|---|---|
| **Nombre** | save — tipo FULL calcula calculatedJourneyTime=40 |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `config.fullTimeValue: 40`

**Datos de Prueba:**
- `assignmentType`: `FULL`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, assignmentType: 'FULL' })` | Servicio llama `calcJourney` |
| 2. Switch retorna `config.fullTimeValue` | Valor `40` |
| 3. Verificar payload a `prisma.create` | `calculatedJourneyTime: 40` |

**Resultado Obtenido:** El test `debe crear asignación FULL con calculatedJourneyTime=40` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-031

| **ID** | CP-U-031 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorAssignmentsService |
|---|---|---|---|---|---|
| **Nombre** | save — THREE_QUARTER usa 0.75 si threeQuarterTimeValue es null |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `config.threeQuarterTimeValue: null`

**Datos de Prueba:**
- `assignmentType`: `THREE_QUARTER`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, assignmentType: 'THREE_QUARTER' })` | Servicio llama `calcJourney` |
| 2. `config.threeQuarterTimeValue ?? 0.75` | Usa fallback `0.75` |
| 3. Verificar payload | `calculatedJourneyTime: 0.75` |

**Resultado Obtenido:** El test `debe usar 0.75 si threeQuarterTimeValue es null/undefined` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-032

| **ID** | CP-U-032 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorAssignmentsService |
|---|---|---|---|---|---|
| **Nombre** | save — campusAllocation conecta si existe en BD |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `prisma.campusJourneyTimeAllocation.findUnique` retorna `{ id: 'alloc-1' }`

**Datos de Prueba:**
- `campusAllocationId`: `alloc-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ ...payload, campusAllocationId: 'alloc-1' })` | Servicio busca la asignación |
| 2. `findUnique` retorna el registro | Relación encontrada |
| 3. Verificar payload a `prisma.create` | `campusAllocation: { connect: { id: 'alloc-1' } }` |

**Resultado Obtenido:** El test `debe conectar campusAllocation si existe` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-033

| **ID** | CP-U-033 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorPortalService |
|---|---|---|---|---|---|
| **Nombre** | generateToken — invalida tokens previos y crea uno nuevo |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `professorPortalToken.updateMany` y `create` mockeados

**Datos de Prueba:**
- `cedula`: `123456`, `campusId`: `campus-1`, `academicCycleId`: `cycle-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `generateToken(dto)` | Servicio invalida tokens anteriores |
| 2. `updateMany({ data: { status: 'EXPIRED' } })` | Tokens previos expirados |
| 3. `randomUUID()` genera token único | UUID generado |
| 4. `professorPortalToken.create` persiste el token | Token nuevo activo |

**Resultado Obtenido:** El test `debe invalidar tokens previos y crear uno nuevo` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-034

| **ID** | CP-U-034 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorPortalService |
|---|---|---|---|---|---|
| **Nombre** | access — token expirado por fecha se marca EXPIRED y lanza UnauthorizedException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Token con `status: ACTIVE` pero `expiresAt` en el pasado

**Datos de Prueba:**
- `token`: `uuid-token`, `cedula`: `123456`, `expiresAt`: `Date.now() - 1000`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `access({ token, cedula })` | Pasa validaciones de existencia y cédula |
| 2. `new Date() > portalToken.expiresAt` resulta `true` | Fecha vencida detectada |
| 3. `professorPortalToken.update({ status: 'EXPIRED' })` | Token invalidado |
| 4. Verificar excepción | Se lanza `UnauthorizedException` |

**Resultado Obtenido:** El test `debe lanzar UnauthorizedException si el token está vencido por fecha` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-035

| **ID** | CP-U-035 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorPortalService |
|---|---|---|---|---|---|
| **Nombre** | submitReport — informe final marca token como USED |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Usuario existe por cédula en BD mock

**Datos de Prueba:**
- `isFinal`: `true`, `matriculados`: `30`, `aprobados`: `25`, `reprobados`: `5`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `submitReport(cedula, ..., { ...dto, isFinal: true })` | Servicio valida aprobados+reprobados |
| 2. `25 + 5 ≤ 30` — validación pasa | Informe procesado |
| 3. `courseReport.upsert` guarda el informe | Registro creado/actualizado |
| 4. `professorPortalToken.update({ status: 'USED' })` | Token marcado como usado |

**Resultado Obtenido:** El test `debe marcar el token como USED al enviar informe final` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-036

| **ID** | CP-U-036 | **Fecha** | 08/04/2026 | **Módulo** | ProfessorPortalService |
|---|---|---|---|---|---|
| **Nombre** | submitReport — aprobados + reprobados > matriculados lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Sin prerrequisitos de BD

**Datos de Prueba:**
- `matriculados`: `30`, `aprobados`: `20`, `reprobados`: `15`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `submitReport(...)` con `20 + 15 > 30` | Servicio valida suma |
| 2. `35 > 30` resulta `true` | Validación fallida |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si aprobados + reprobados > matriculados` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-037

| **ID** | CP-U-037 | **Fecha** | 08/04/2026 | **Módulo** | AnnualJourneyTimeAllocationsService |
|---|---|---|---|---|---|
| **Nombre** | getActive — retorna null si no hay asignación activa |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findAll` retorna solo asignaciones con status `INACTIVE`

**Datos de Prueba:**
- BD con `[{ status: 'INACTIVE' }]`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `getActive()` | Servicio busca asignaciones |
| 2. `result.data.find(a => a.status === 'ACTIVE')` — no encuentra | Sin asignación activa |
| 3. Verificar retorno | Retorna `null` |

**Resultado Obtenido:** El test `debe retornar null si no hay asignación activa` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-038

| **ID** | CP-U-038 | **Fecha** | 08/04/2026 | **Módulo** | AnnualJourneyTimeAllocationsService |
|---|---|---|---|---|---|
| **Nombre** | getYearSummary — campus sobreconsumo no genera disponible negativo |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Campus con `allocatedJourneyTime: 5`, profesor activo con `calculatedJourneyTime: 50`

**Datos de Prueba:**
- `year`: `2024`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `getYearSummary(2024)` | Servicio calcula disponible |
| 2. `available = 5 - 50 = -45` | Valor negativo calculado |
| 3. Lógica protectora aplicada | `available < 0 ? 0 : available` |
| 4. Verificar resultado | `campus.available === 0` |

**Resultado Obtenido:** El test `debe poner available=0 si el consumo supera lo asignado` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-039

| **ID** | CP-U-039 | **Fecha** | 08/04/2026 | **Módulo** | InstitutionalProjectsService |
|---|---|---|---|---|---|
| **Nombre** | create — campusAllocationId se convierte a formato connect de Prisma |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.save` mockeado con respuesta válida

**Datos de Prueba:**
- `name`: `Proyecto Alpha`, `campusAllocationId`: `alloc-1`, `directorId`: `user-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `create(dto)` | Servicio desestructura el DTO |
| 2. Verificar `campusAllocationId` | Convertido a `{ connect: { id: 'alloc-1' } }` |
| 3. Verificar `directorId` | Convertido a `{ connect: { id: 'user-1' } }` |
| 4. Verificar llamada a `repo.save` | Llamado con estructura Prisma correcta |

**Resultado Obtenido:** El test `debe crear proyecto con campusAllocationId y directorId como connect` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-040

| **ID** | CP-U-040 | **Fecha** | 08/04/2026 | **Módulo** | InstitutionalProjectsService |
|---|---|---|---|---|---|
| **Nombre** | calculateTotalAssignedTime — retorna objeto `{ total }` |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.calculateTotalAssignedTime` retorna `42`

**Datos de Prueba:**
- `campusAllocationId`: `alloc-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `calculateTotalAssignedTime('alloc-1')` | Servicio delega al repo |
| 2. Repo retorna `42` (número primitivo) | Valor recibido |
| 3. Verificar retorno del servicio | Retorna `{ total: 42 }` (objeto) |

**Resultado Obtenido:** El test `debe retornar el total envuelto en objeto { total }` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-041

| **ID** | CP-U-041 | **Fecha** | 08/04/2026 | **Módulo** | RepitenciasService |
|---|---|---|---|---|---|
| **Nombre** | calculateTotalAdditionalHours — retorna objeto `{ total }` |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.calculateTotalAdditionalHours` retorna `42`

**Datos de Prueba:**
- `campusAllocationId`: `alloc-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `calculateTotalAdditionalHours('alloc-1')` | Servicio delega al repo |
| 2. Repo retorna `42` | Valor recibido |
| 3. Verificar retorno | Retorna `{ total: 42 }` |

**Resultado Obtenido:** El test `debe retornar el total envuelto en objeto` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-042

| **ID** | CP-U-042 | **Fecha** | 08/04/2026 | **Módulo** | RepitenciasService |
|---|---|---|---|---|---|
| **Nombre** | findByCampus / findByCourse / findByAcademicCycle — delegan al repositorio |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Métodos del repositorio mockeados con `[repitencia]`

**Datos de Prueba:**
- `campusId`: `campus-1`, `courseId`: `course-1`, `academicCycleId`: `cycle-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `findByCampus('campus-1')` | `repo.findByCampus` llamado |
| 2. Llamar `findByCourse('course-1')` | `repo.findByCourse` llamado |
| 3. Llamar `findByAcademicCycle('cycle-1')` | `repo.findByAcademicCycle` llamado |
| 4. Verificar retornos | Cada uno retorna `[repitencia]` |

**Resultado Obtenido:** Los tres tests de filtrado pasan. Los métodos delegan correctamente al repositorio.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-043

| **ID** | CP-U-043 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentTypesService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — tipo con documentos activos lanza BadRequestException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findById` retorna tipo con `proofDocuments: [{ status: 'ACTIVE' }]`
- `repo.count` retorna `1`

**Datos de Prueba:**
- `id`: `type-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('type-1')` | Servicio obtiene tipo con documentos |
| 2. Detecta `1` documento activo — log de advertencia | `logger.warn` llamado |
| 3. `super.deleteById` verifica `relationCheckConfig` | `repo.count` retorna `1` |
| 4. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si tiene documentos activos` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-044

| **ID** | CP-U-044 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService |
|---|---|---|---|---|---|
| **Nombre** | save — genera código automático y registra en historial |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.generateNextCode` retorna `'DOC-001'`

**Datos de Prueba:**
- `name`: `Convenio UNA`, `proofDocumentTypeId`: `type-1`, `evidenceId`: `ev-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save(dto)` | Servicio llama `generateNextCode` |
| 2. Código `DOC-001` generado | Incluido en `dataWithCode` |
| 3. `repo.save` llamado con `code: 'DOC-001'` | Documento creado |
| 4. `historyService.logChange({ changeType: 'CREATED' })` | Historial registrado |

**Resultado Obtenido:** El test `debe generar el código automático y crear el documento` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-045

| **ID** | CP-U-045 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService |
|---|---|---|---|---|---|
| **Nombre** | save — fallo en historial no interrumpe la operación |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `historyService.logChange` lanza `Error('History DB error')`

**Datos de Prueba:**
- DTO válido de creación de documento

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save(dto)` | Documento se crea correctamente |
| 2. `historyService.logChange` lanza excepción | Error capturado en bloque `try/catch` |
| 3. Verificar que no re-lanza | La operación principal continúa |
| 4. Verificar retorno | Documento retornado correctamente |

**Resultado Obtenido:** El test `no debe fallar si el historial lanza error (operación no crítica)` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-046

| **ID** | CP-U-046 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService |
|---|---|---|---|---|---|
| **Nombre** | deleteById — continúa eliminación de BD aunque Drive falle |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `googleDriveService.deleteFile` lanza `Error('Drive error')`
- Usuario con `googleAccessToken` disponible

**Datos de Prueba:**
- `id`: `doc-1`, `googleDriveFileId`: `drive-file-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('doc-1')` | Servicio intenta borrar de Drive |
| 2. `deleteFile` lanza error | Error capturado en `try/catch` interno |
| 3. Flujo continúa | `super.deleteById` es llamado |
| 4. Verificar retorno | Retorna `true` (eliminación de BD exitosa) |

**Resultado Obtenido:** El test `debe continuar con eliminación de BD aunque Drive falle` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-047

| **ID** | CP-U-047 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistoryService |
|---|---|---|---|---|---|
| **Nombre** | detectChanges — campos de auditoría son ignorados |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Servicio instanciado con mocks

**Datos de Prueba:**
- `oldDocument`: `{ id: 'old', name: 'Nombre', createdAt: <fecha1>, updatedAt: <fecha1> }`
- `newDocument`: `{ name: 'Nombre Nuevo', createdAt: <fecha2>, updatedAt: <fecha2> }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `detectChanges(oldDoc, newDoc)` | Servicio compara campos |
| 2. `name` cambió | Incluido en resultado |
| 3. `id`, `createdAt`, `updatedAt` cambiaron | Todos ignorados |
| 4. Verificar resultado | Solo `[{ field: 'name', ... }]` |

**Resultado Obtenido:** El test `debe ignorar campos de auditoría (id, createdAt, updatedAt)` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-048

| **ID** | CP-U-048 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistoryService |
|---|---|---|---|---|---|
| **Nombre** | detectChanges — objetos se serializan como JSON para comparación |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Servicio instanciado con mocks

**Datos de Prueba:**
- `oldDocument`: `{ metadata: { key: 'old' } }`
- `newDocument`: `{ metadata: { key: 'new' } }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `detectChanges(oldDoc, newDoc)` | Servicio detecta cambio en `metadata` |
| 2. `JSON.stringify` aplicado a ambos valores | Comparación de strings JSON |
| 3. Verificar resultado | `[{ field: 'metadata', oldValue: '{"key":"old"}', newValue: '{"key":"new"}' }]` |

**Resultado Obtenido:** El test `debe serializar objetos como JSON` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-049

| **ID** | CP-U-049 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistoryService |
|---|---|---|---|---|---|
| **Nombre** | getActivityStatistics — agrupa actividad reciente por día |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- BD mock con 3 cambios en `2024-01-15` y 2 cambios en `2024-01-16`

**Datos de Prueba:**
- Sin filtros (estadísticas globales)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `getActivityStatistics()` | Servicio consulta toda la actividad |
| 2. Registros agrupados por día | `2024-01-15: 3`, `2024-01-16: 2` |
| 3. Verificar estructura | `{ recentActivity: [{ date, count }] }` |

**Resultado Obtenido:** El test `debe agrupar actividad reciente por día correctamente` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-050

| **ID** | CP-U-050 | **Fecha** | 08/04/2026 | **Módulo** | UserRolesService |
|---|---|---|---|---|---|
| **Nombre** | findRoleWithPermissions — lista rol con sus permisos integrados |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Rol `r1` existe con permisos `[{ id: 'p1', name: 'READ_USERS' }]`

**Datos de Prueba:**
- `roleId`: `r1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `findRoleWithPermissions('r1')` | Servicio busca rol con permisos |
| 2. Rol encontrado con permisos | Estructura completa retornada |
| 3. Verificar formato de permisos | Permisos estructurados correctamente |

**Resultado Obtenido:** El test `Lista rol con sus respectivos permisos integrados` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-051

| **ID** | CP-U-051 | **Fecha** | 08/04/2026 | **Módulo** | GenericController |
|---|---|---|---|---|---|
| **Nombre** | findAll — parsea orderBy desde JSON y transforma filtros numéricos |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `GenericController` instanciado con mock de `GenericService`

**Datos de Prueba:**
- `orderBy`: `'{"name":"asc"}'` (JSON string), `filters`: `{ page: '1', limit: '10' }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `findAll({ orderBy: '{"name":"asc"}', page: '1', limit: '10' })` | Controlador parsea orderBy |
| 2. `JSON.parse('{"name":"asc"}')` | Objeto `{ name: 'asc' }` |
| 3. `page` y `limit` convertidos a número | `page: 1`, `limit: 10` |
| 4. Verificar llamada al servicio | Llamado con tipos correctos |

**Resultado Obtenido:** El test `debe parsear orderBy desde JSON y pasar filtros transformados` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-052

| **ID** | CP-U-052 | **Fecha** | 08/04/2026 | **Módulo** | GenericController |
|---|---|---|---|---|---|
| **Nombre** | findById — lanza NotFoundException si el registro no existe |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `service.findById` retorna `null`

**Datos de Prueba:**
- `id`: `no-existe`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `findById('no-existe')` | Controlador llama al servicio |
| 2. Servicio retorna `null` | Registro no encontrado |
| 3. Verificar excepción | Se lanza `NotFoundException` |

**Resultado Obtenido:** El test `debe lanzar NotFoundException cuando el registro no existe` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-053

| **ID** | CP-U-053 | **Fecha** | 08/04/2026 | **Módulo** | FinalReportsService |
|---|---|---|---|---|---|
| **Nombre** | save — crea FinalReport validando el DTO correctamente |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.save` mockeado con respuesta válida

**Datos de Prueba:**
- `projectId`: `proj-1`, `status`: `PENDING`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `save({ projectId: 'proj-1', status: 'PENDING' })` | Servicio valida DTO |
| 2. Validación pasa | `repo.save` llamado |
| 3. Verificar retorno | FinalReport creado con `id` |

**Resultado Obtenido:** El test `Crea un FinalReport exitosamente validando el DTO` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-054

| **ID** | CP-U-054 | **Fecha** | 08/04/2026 | **Módulo** | FinalReportsService |
|---|---|---|---|---|---|
| **Nombre** | cron — actualiza reportes PENDING a EVALUATED |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findAll` retorna `[{ id: 'r1', status: 'PENDING' }]`

**Datos de Prueba:**
- Reportes pendientes: `1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Ejecutar job cron | Servicio busca reportes pendientes |
| 2. `repo.findAll` retorna `[r1]` | Reporte encontrado |
| 3. `repo.update('r1', { status: 'EVALUATED' })` | Estado actualizado |
| 4. Verificar llamada al update | Cada reporte actualizado |

**Resultado Obtenido:** El test `Actualiza a EVALUATED a cada reporte devuelto` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-055

| **ID** | CP-U-055 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDriveService |
|---|---|---|---|---|---|
| **Nombre** | createFolderStructure — reutiliza carpeta existente en Drive |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `drive.files.list` retorna carpeta existente `{ id: 'existing-folder' }`

**Datos de Prueba:**
- `dimensionCode`: `D-01` (ya existe en Drive)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `createFolderStructure(folderStructure, accessToken)` | Servicio busca carpeta existente |
| 2. `drive.files.list` retorna carpeta | Carpeta reutilizada |
| 3. Verificar que `drive.files.create` no fue llamado para esta carpeta | Sin creación duplicada |

**Resultado Obtenido:** El test `debe reutilizar carpeta existente si ya existe en Drive` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-056

| **ID** | CP-U-056 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDriveService |
|---|---|---|---|---|---|
| **Nombre** | uploadFile — token expirado lanza UnauthorizedException |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `drive.files.list` lanza error con código `401`

**Datos de Prueba:**
- `accessToken`: `expired-token`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `uploadFile(file, folderId, careers, accessToken)` | Servicio intenta subir |
| 2. Drive retorna error `401` | Token expirado detectado |
| 3. Verificar excepción | Se lanza `UnauthorizedException` |

**Resultado Obtenido:** El test `debe lanzar UnauthorizedException si el token expira durante la subida` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-057

| **ID** | CP-U-057 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDriveService |
|---|---|---|---|---|---|
| **Nombre** | uploadFile — lanza BadRequestException si archivo ya existe en carpeta |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `drive.files.list` retorna archivo con mismo nombre

**Datos de Prueba:**
- `file.originalname`: `DOC-001_convenio.pdf` (ya existe en carpeta)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `uploadFile(file, folderId, ...)` | Servicio verifica duplicados |
| 2. `drive.files.list` retorna archivo existente | Duplicado detectado |
| 3. Verificar excepción | Se lanza `BadRequestException` |

**Resultado Obtenido:** El test `debe lanzar BadRequestException si el archivo ya existe en la carpeta` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-058

| **ID** | CP-U-058 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDriveService |
|---|---|---|---|---|---|
| **Nombre** | updateCarrerasFile — actualiza archivo existente con update en lugar de create |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- `drive.files.list` retorna `_carreras.txt` existente con `id: 'carreras-file-id'`

**Datos de Prueba:**
- `folderId`: `folder-1`, `documentCode`: `DOC-001`, `careerNames`: `['Carrera A']`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `updateCarrerasFile(folderId, code, careerNames, token)` | Servicio busca `_carreras.txt` |
| 2. Archivo encontrado | Flujo de actualización activado |
| 3. `drive.files.update` llamado | Archivo actualizado, no creado de nuevo |
| 4. `drive.files.create` no llamado | Sin duplicado |

**Resultado Obtenido:** El test `debe actualizar archivo existente con update en lugar de create` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-059

| **ID** | CP-U-059 | **Fecha** | 08/04/2026 | **Módulo** | QuestionsService |
|---|---|---|---|---|---|
| **Nombre** | findByStep — agrupa preguntas por nombre de grupo |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- BD mock con preguntas de `step: 1` en grupos distintos

**Datos de Prueba:**
- `step`: `1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar método de búsqueda por paso | Servicio consulta preguntas del paso |
| 2. Preguntas agrupadas por nombre de grupo | Estructura jerárquica |
| 3. Verificar formato | `[{ groupName, questions: [...] }]` |

**Resultado Obtenido:** El test `Debe agrupar preguntas por nombre de grupo` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

### CP-U-060

| **ID** | CP-U-060 | **Fecha** | 08/04/2026 | **Módulo** | UsersService — extra |
|---|---|---|---|---|---|
| **Nombre** | getUserActiveRolesWithPermissions — filtra permisos inactivos |
| **Tipo de Prueba** | Unitaria | **Estado** | ✅ PASÓ |

**Precondición:**
- Usuario con rol que tiene permisos activos e inactivos mezclados

**Datos de Prueba:**
- `userId`: `u1`, permisos: `[{ id: 'p1', active: true }, { id: 'p2', active: false }]`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `getUserActiveRolesWithPermissions('u1')` | Servicio obtiene roles del usuario |
| 2. Filtra permisos por `active: true` | Solo `p1` incluido |
| 3. Verificar retorno | Solo permisos activos en la respuesta |

**Resultado Obtenido:** El test `debe filtrar permisos que no están activos en el permissionMap` pasa.

**Prueba ejecutada por:** Ángel Segura Méndez

---

## PRUEBAS MODULARES
> Responsable: **Francisco Mora Cabezas**

---

### CP-M-001

| **ID** | CP-M-001 | **Fecha** | 08/04/2026 | **Módulo** | Auth (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /auth/authenticate — valida credenciales y responde 200 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `AuthModule` cargado con `Test.createTestingModule`
- Supertest configurado con la app NestJS

**Datos de Prueba:**
- Endpoint: `POST /auth/authenticate`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /auth/authenticate` con credenciales mock | Request llega al controlador |
| 2. Controlador llama a `AuthService.googleLogin` | Servicio procesa autenticación |
| 3. Verificar código de respuesta | `200` o `201` |
| 4. Verificar cuerpo de respuesta | Contiene datos de sesión |

**Resultado Obtenido:** El test `POST /auth/authenticate — Debe validar credenciales (MOCK) responde 200 o 201` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-002

| **ID** | CP-M-002 | **Fecha** | 08/04/2026 | **Módulo** | Auth (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /auth/me — obtiene perfil del usuario autenticado |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Token JWT válido en el header

**Datos de Prueba:**
- Endpoint: `GET /auth/me`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /auth/me` con token en header | Request llega al guard JWT |
| 2. Guard valida el token | Usuario extraído del token |
| 3. Controlador llama a `AuthService.meGetUser` | Perfil obtenido del servicio |
| 4. Verificar código de respuesta | `200` |

**Resultado Obtenido:** El test `GET /auth/me — Obtiene perfil de usuario actual — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-003

| **ID** | CP-M-003 | **Fecha** | 08/04/2026 | **Módulo** | Auth (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /auth/logout — cierra sesión correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Token JWT válido en el header

**Datos de Prueba:**
- Endpoint: `POST /auth/logout`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /auth/logout` | Request al controlador |
| 2. Controlador llama a `revokeRefreshToken` | Token revocado |
| 3. Verificar código de respuesta | `200` |

**Resultado Obtenido:** El test `POST /auth/logout — Cierra sesión — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-004

| **ID** | CP-M-004 | **Fecha** | 08/04/2026 | **Módulo** | Users (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /users — lista usuarios con código 200 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `UsersModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /users`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /users` | Request al controlador |
| 2. Controlador llama a `UsersService.findAll` | Lista paginada obtenida |
| 3. Verificar código de respuesta | `200` |
| 4. Verificar cuerpo | `{ data: [], meta: { total } }` |

**Resultado Obtenido:** El test `GET /users — Lista usuarios — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-005

| **ID** | CP-M-005 | **Fecha** | 08/04/2026 | **Módulo** | Users (Modular) |
|---|---|---|---|---|---|
| **Nombre** | PATCH /users/:id/profile — actualiza perfil limpiando campos vacíos |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `UsersModule` cargado, usuario existente en BD de prueba

**Datos de Prueba:**
- Endpoint: `PATCH /users/:id/profile`
- Body: `{ fullName: '', email: 'valido@una.cr' }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `PATCH /users/:id/profile` con body mixto | Request al controlador |
| 2. Controlador llama a `UsersService.updateProfile` | Campos vacíos filtrados |
| 3. Solo `email` actualizado en BD | `fullName` ignorado |
| 4. Verificar código de respuesta | `200` |

**Resultado Obtenido:** El test `PATCH /users/:id/profile — Actualiza perfil limpiando campos vacíos` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-006

| **ID** | CP-M-006 | **Fecha** | 08/04/2026 | **Módulo** | Users (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /users/:id — usuario no encontrado responde 404 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `UsersModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /users/id-inexistente`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /users/id-inexistente` | Request al controlador |
| 2. `UsersService.findById` retorna `null` | Usuario no encontrado |
| 3. Controlador lanza `NotFoundException` | Error propagado |
| 4. Verificar código de respuesta | `404` |

**Resultado Obtenido:** El test `GET /users/:id — Usuario no encontrado — responde 404` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-007

| **ID** | CP-M-007 | **Fecha** | 08/04/2026 | **Módulo** | Projects (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /projects — crea proyecto y responde 201 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `ProjectsModule` cargado con BD de prueba

**Datos de Prueba:**
- Endpoint: `POST /projects`, body con datos válidos del proyecto

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /projects` con body válido | Request al controlador |
| 2. Controlador llama a `ProjectsService.save` | Proyecto creado en BD |
| 3. Verificar código de respuesta | `201` |
| 4. Verificar cuerpo | Proyecto con `id` generado |

**Resultado Obtenido:** El test `POST /projects — Crea proyecto — responde 201` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-008

| **ID** | CP-M-008 | **Fecha** | 08/04/2026 | **Módulo** | Projects (Modular) |
|---|---|---|---|---|---|
| **Nombre** | DELETE /projects/:id — intento con documentos activos responde 400 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Proyecto con documentos activos en BD de prueba

**Datos de Prueba:**
- Endpoint: `DELETE /projects/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `DELETE /projects/:id` | Request al controlador |
| 2. `ProjectsService.deleteById` detecta docs activos | `BadRequestException` lanzada |
| 3. NestJS convierte excepción | Respuesta de error |
| 4. Verificar código de respuesta | `400` |

**Resultado Obtenido:** El test `DELETE /projects/:id — Intenta eliminar con docs activos — responde 400` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-009

| **ID** | CP-M-009 | **Fecha** | 08/04/2026 | **Módulo** | Cohorts (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /cohorts — crea cohorte y responde 201 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CohortsModule` cargado con BD de prueba

**Datos de Prueba:**
- Endpoint: `POST /cohorts`, body: `{ name: '2024-A', careerId: 'career-1' }`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /cohorts` | Request al controlador |
| 2. `CohortsService.save` crea la cohorte | Registro en BD |
| 3. Verificar código de respuesta | `201` |
| 4. Verificar cohorte en respuesta | Tiene `id` y `status: ACTIVE` |

**Resultado Obtenido:** El test `POST /cohorts — Crea cohorte — responde 201` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-010

| **ID** | CP-M-010 | **Fecha** | 08/04/2026 | **Módulo** | Cohorts (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /cohorts/:id — ID inexistente responde 404 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CohortsModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /cohorts/id-que-no-existe`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /cohorts/id-que-no-existe` | Request al controlador |
| 2. `CohortsService.findById` lanza `NotFoundException` | Error propagado |
| 3. NestJS convierte excepción | Respuesta de error |
| 4. Verificar código de respuesta | `404` |

**Resultado Obtenido:** El test `GET /cohorts/:id — ID inexistente — responde 404` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-011

| **ID** | CP-M-011 | **Fecha** | 08/04/2026 | **Módulo** | Standards (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /standards — crea estándar y responde 201 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `StandardsModule` cargado

**Datos de Prueba:**
- Endpoint: `POST /standards`, body con nombre único

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /standards` con nombre único | Request al controlador |
| 2. `StandardsService.save` verifica nombre | No existe duplicado |
| 3. Repositorio persiste el estándar | Registro creado |
| 4. Verificar código de respuesta | `201` |

**Resultado Obtenido:** El test `POST /standards — Crea registro — responde 201` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-012

| **ID** | CP-M-012 | **Fecha** | 08/04/2026 | **Módulo** | Commissions (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /commissions — crea comisión y responde 201 |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CommissionsModule` cargado

**Datos de Prueba:**
- Endpoint: `POST /commissions`, body con datos válidos

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /commissions` | Request al controlador |
| 2. `CommissionsService.save` crea la comisión | Registro en BD |
| 3. Verificar código de respuesta | `201` |

**Resultado Obtenido:** El test `POST /commissions — Crea registro — responde 201` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-013

| **ID** | CP-M-013 | **Fecha** | 08/04/2026 | **Módulo** | AcademicCycles (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /academic-cycles — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `AcademicCyclesModule` cargado con BD de prueba

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /academic-cycles` | `201` — ciclo creado |
| 2. `GET /academic-cycles` | `200` — lista paginada |
| 3. `GET /academic-cycles/:id` | `200` — ciclo específico |
| 4. `PUT /academic-cycles/:id` | `200` o `204` — actualizado |
| 5. `DELETE /academic-cycles/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de ciclos académicos pasan. Flujo CRUD completo validado.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-014

| **ID** | CP-M-014 | **Fecha** | 08/04/2026 | **Módulo** | QualityEvidences (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /quality-evidences — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `QualityEvidencesModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /quality-evidences` | `201` — evidencia creada |
| 2. `GET /quality-evidences` | `200` — lista paginada |
| 3. `GET /quality-evidences/:id` | `200` — evidencia específica |
| 4. `PUT /quality-evidences/:id` | `200` o `204` — actualizada |
| 5. `DELETE /quality-evidences/:id` | `200` o `204` — eliminada |

**Resultado Obtenido:** Los 5 tests de gestión de evidencias de calidad SINAES pasan correctamente.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-015

| **ID** | CP-M-015 | **Fecha** | 08/04/2026 | **Módulo** | FinalReports (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /final-reports — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `FinalReportsModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /final-reports` | `201` — reporte creado |
| 2. `GET /final-reports` | `200` — lista paginada |
| 3. `GET /final-reports/:id` | `200` — reporte específico |
| 4. `PUT /final-reports/:id` | `200` o `204` — actualizado |
| 5. `DELETE /final-reports/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de reportes finales pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-016

| **ID** | CP-M-016 | **Fecha** | 08/04/2026 | **Módulo** | Questions (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD /questions — creación, listado, actualización y eliminación |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `QuestionsModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /questions` | `201` — pregunta creada |
| 2. `GET /questions` | `200` — lista de preguntas |
| 3. `PUT /questions/:id` | `200` o `204` — actualizada |
| 4. `DELETE /questions/:id` | `200` o `204` — eliminada |

**Resultado Obtenido:** Los 4 tests del módulo de gestión de preguntas pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-017

| **ID** | CP-M-017 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocuments (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /proof-documents — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `ProofDocumentsModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /proof-documents` | `201` — documento creado |
| 2. `GET /proof-documents` | `200` — lista paginada |
| 3. `GET /proof-documents/:id` | `200` — documento específico |
| 4. `PUT /proof-documents/:id` | `200` o `204` — actualizado |
| 5. `DELETE /proof-documents/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de documentos de prueba SINAES pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-018

| **ID** | CP-M-018 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentTypes (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /proof-document-types — todos los endpoints responden |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `ProofDocumentTypesModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /proof-document-types` | `201` — tipo creado |
| 2. `GET /proof-document-types` | `200` — lista paginada |
| 3. `GET /proof-document-types/:id` | `200` — tipo específico |
| 4. `PUT /proof-document-types/:id` | `200` o `204` — actualizado |
| 5. `DELETE /proof-document-types/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests de tipos de documentos de prueba pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-019

| **ID** | CP-M-019 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistory (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /sinaes-document-history/document/:id — obtiene historial del documento |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `SinaesDocumentHistoryModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /sinaes-document-history/document/:documentId`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /sinaes-document-history/document/doc-1` | Request al controlador |
| 2. `SinaesDocumentHistoryService` consulta historial | Registros obtenidos |
| 3. Verificar código de respuesta | `200` |
| 4. Verificar cuerpo | Lista de cambios históricos |

**Resultado Obtenido:** El test `GET /sinaes-document-history/document/:documentId — Obtiene historial del doc — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-020

| **ID** | CP-M-020 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistory (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /sinaes-document-history/statistics — obtiene estadísticas de auditoría |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `SinaesDocumentHistoryModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /sinaes-document-history/statistics`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /sinaes-document-history/statistics` | Request al controlador |
| 2. `getActivityStatistics` ejecutado | Estadísticas calculadas |
| 3. Verificar código de respuesta | `200` |
| 4. Verificar estructura | Incluye `recentActivity` agrupada por día |

**Resultado Obtenido:** El test `GET /sinaes-document-history/statistics — Obtiene estadísticas — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-021

| **ID** | CP-M-021 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDrive (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /google-drive/create-structure — crea estructura de carpetas |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `GoogleDriveModule` cargado con mocks de googleapis

**Datos de Prueba:**
- Endpoint: `POST /google-drive/create-structure`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /google-drive/create-structure` con jerarquía SINAES | Request al controlador |
| 2. `GoogleDriveService.createFolderStructure` ejecutado | Estructura creada en Drive |
| 3. Verificar código de respuesta | `200` o `201` |
| 4. Verificar cuerpo | `{ id, path }` de la carpeta creada |

**Resultado Obtenido:** El test `POST /google-drive/create-structure` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-022

| **ID** | CP-M-022 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDrive (Modular) |
|---|---|---|---|---|---|
| **Nombre** | POST /google-drive/upload — sube archivo al Drive |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `GoogleDriveModule` cargado

**Datos de Prueba:**
- Endpoint: `POST /google-drive/upload`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `POST /google-drive/upload` con file y folderId | Request al controlador |
| 2. `GoogleDriveService.uploadFile` ejecutado | Archivo subido |
| 3. Verificar código de respuesta | `200` |
| 4. Verificar cuerpo | `{ id, url, size }` del archivo |

**Resultado Obtenido:** El test `POST /google-drive/upload` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-023

| **ID** | CP-M-023 | **Fecha** | 08/04/2026 | **Módulo** | SinaesReports (Modular) |
|---|---|---|---|---|---|
| **Nombre** | GET /sinaes-reports/compliance — genera reporte de cumplimiento SINAES |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `SinaesReportsModule` cargado

**Datos de Prueba:**
- Endpoint: `GET /sinaes-reports/compliance`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `GET /sinaes-reports/compliance` | Request al controlador |
| 2. `SinaesReportsService` genera el reporte | Datos de cumplimiento calculados |
| 3. Verificar código de respuesta | `200` |
| 4. Verificar estructura del reporte | Incluye porcentajes de cumplimiento |

**Resultado Obtenido:** El test `GET /sinaes-reports/compliance — Genera reporte — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-024

| **ID** | CP-M-024 | **Fecha** | 08/04/2026 | **Módulo** | AnnualJourneyTimeAllocations (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /annual-journey-time-allocations — todos los endpoints responden |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `AnnualJourneyTimeAllocationsModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /annual-journey-time-allocations` | `201` — asignación anual creada |
| 2. `GET /annual-journey-time-allocations` | `200` — lista |
| 3. `GET /annual-journey-time-allocations/:id` | `200` — registro específico |
| 4. `PUT /annual-journey-time-allocations/:id` | `200` o `204` — actualizado |
| 5. `DELETE /annual-journey-time-allocations/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de asignaciones anuales de jornada pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-025

| **ID** | CP-M-025 | **Fecha** | 08/04/2026 | **Módulo** | CampusJourneyTimeAllocations (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /campus-journey-time-allocations — todos los endpoints responden |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CampusJourneyTimeAllocationsModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /campus-journey-time-allocations` | `201` — asignación de campus creada |
| 2. `GET /campus-journey-time-allocations` | `200` — lista |
| 3. `GET /campus-journey-time-allocations/:id` | `200` — registro específico |
| 4. `PUT /campus-journey-time-allocations/:id` | `200` o `204` — actualizado |
| 5. `DELETE /campus-journey-time-allocations/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de asignaciones de jornada por campus pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-026

| **ID** | CP-M-026 | **Fecha** | 08/04/2026 | **Módulo** | UserPermissions (Modular) |
|---|---|---|---|---|---|
| **Nombre** | PATCH /user-permissions/:id/switch-status — cambia estado de permiso |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `UserPermissionsModule` cargado

**Datos de Prueba:**
- Endpoint: `PATCH /user-permissions/:id/switch-status`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Enviar `PATCH /user-permissions/:id/switch-status` | Request al controlador |
| 2. `UserPermissionsService.switchStatus` ejecutado | Estado cambiado |
| 3. Verificar código de respuesta | `200` |

**Resultado Obtenido:** El test `PATCH /user-permissions/:id/switch-status — Cambia el estado — responde 200` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-027

| **ID** | CP-M-027 | **Fecha** | 08/04/2026 | **Módulo** | Courses (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /courses — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CoursesModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /courses` | `201` — curso creado |
| 2. `GET /courses` | `200` — lista paginada |
| 3. `GET /courses/:id` | `200` — curso específico |
| 4. `PUT /courses/:id` | `200` o `204` — actualizado |
| 5. `DELETE /courses/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de cursos pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-028

| **ID** | CP-M-028 | **Fecha** | 08/04/2026 | **Módulo** | Campuses (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD completo /campuses — todos los endpoints responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `CampusesModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /campuses` | `201` — campus creado |
| 2. `GET /campuses` | `200` — lista paginada |
| 3. `GET /campuses/:id` | `200` — campus específico |
| 4. `PUT /campuses/:id` | `200` o `204` — actualizado |
| 5. `DELETE /campuses/:id` | `200` o `204` — eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de campus pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-029

| **ID** | CP-M-029 | **Fecha** | 08/04/2026 | **Módulo** | Dimensions / Components / Criteria (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD jerarquía SINAES — Dimensiones, Componentes y Criterios responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulos `DimensionsModule`, `ComponentsModule`, `CriteriaModule` cargados

**Datos de Prueba:**
- Endpoints de cada módulo: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /dimensions` → `201` | Dimensión SINAES creada |
| 2. `POST /components` → `201` | Componente SINAES creado |
| 3. `POST /criteria` → `201` | Criterio SINAES creado |
| 4. `GET` en cada módulo | `200` con lista paginada |
| 5. `DELETE` en cada módulo | `200` o `204` eliminado |

**Resultado Obtenido:** Los 15 tests de la jerarquía SINAES (5 por módulo × 3 módulos) pasan correctamente.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-030

| **ID** | CP-M-030 | **Fecha** | 08/04/2026 | **Módulo** | Schedules / Classrooms (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD /schedules y /classrooms — módulos auxiliares responden correctamente |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulos `SchedulesModule` y `ClassroomsModule` cargados

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /schedules` → `201` | Horario creado |
| 2. `POST /classrooms` → `201` | Aula creada |
| 3. `GET` en ambos | `200` con listas |
| 4. `PUT/:id` en ambos | `200` o `204` |
| 5. `DELETE/:id` en ambos | `200` o `204` |

**Resultado Obtenido:** Los 10 tests de módulos auxiliares de cargas académicas pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-031

| **ID** | CP-M-031 | **Fecha** | 08/04/2026 | **Módulo** | UserLanguages / UserWorkExperiences (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD módulos de perfil de usuario — idiomas y experiencias laborales |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulos `UserLanguagesModule` y `UserWorkExperiencesModule` cargados

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /user-languages` → `201` | Idioma creado |
| 2. `POST /user-work-experiences` → `201` | Experiencia creada |
| 3. `GET` en ambos módulos | `200` con listas |
| 4. `DELETE/:id` en ambos | `200` o `204` |

**Resultado Obtenido:** Los 10 tests de módulos de perfil de usuario pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-032

| **ID** | CP-M-032 | **Fecha** | 08/04/2026 | **Módulo** | ExternalProviders (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD /external-providers — gestión de proveedores externos de jornada |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulo `ExternalProvidersModule` cargado

**Datos de Prueba:**
- Endpoints: `POST`, `GET`, `GET/:id`, `PUT/:id`, `DELETE/:id`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /external-providers` → `201` | Proveedor externo creado |
| 2. `GET /external-providers` → `200` | Lista de proveedores |
| 3. `GET /external-providers/:id` → `200` | Proveedor específico |
| 4. `PUT /external-providers/:id` → `200`/`204` | Actualizado |
| 5. `DELETE /external-providers/:id` → `200`/`204` | Eliminado |

**Resultado Obtenido:** Los 5 tests del módulo de proveedores externos pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-033

| **ID** | CP-M-033 | **Fecha** | 08/04/2026 | **Módulo** | Faculties / Schools / RegionalCenters (Modular) |
|---|---|---|---|---|---|
| **Nombre** | CRUD módulos institucionales — Facultades, Escuelas y Centros Regionales |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Módulos institucionales cargados

**Datos de Prueba:**
- Endpoints CRUD de cada módulo

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. `POST /faculties` → `201` | Facultad creada |
| 2. `POST /regional-centers` → `201` | Centro regional creado |
| 3. `GET` en todos los módulos | `200` con listas |
| 4. `DELETE/:id` en todos | `200` o `204` |

**Resultado Obtenido:** Los 15 tests de módulos institucionales (5 por módulo × 3) pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-034

| **ID** | CP-M-034 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService — uploadProofDocumentWithDrive |
|---|---|---|---|---|---|
| **Nombre** | Subida completa con jerarquía SINAES via Standard — flujo orquestado |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `ProofDocumentsService` instanciado con todos sus colaboradores mockeados
- Evidencia con jerarquía `Standard → Criterion → Component → Dimension`
- Sin documentos duplicados en BD

**Datos de Prueba:**
- `file.originalname`: `documento.pdf`
- `uploadDto.careerIds`: `['career-1', 'career-2']`
- `accessToken`: `valid-token`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `uploadProofDocumentWithDrive(file, dto, token)` | Inicia flujo de 9 pasos |
| 2. `getEvidenceHierarchy` resuelve jerarquía completa | Jerarquía SINAES navegada |
| 3. `GoogleDriveService.createFolderStructure` crea carpetas | `{ id, path }` retornado |
| 4. `GoogleDriveService.uploadFile` sube el archivo | `{ id, url, size }` retornado |
| 5. `generateNextCode` genera código único | `DOC-002` asignado |
| 6. `super.save` persiste documento en BD | Documento creado |
| 7. `careerProofDocument.create` × 2 | 2 relaciones carrera-documento creadas |
| 8. Verificar resultado | `{ proofDocument, careerRelations, folderPath }` |

**Resultado Obtenido:** El test `debe subir el archivo y crear el documento con jerarquía via standard` pasa. Orquestación completa entre 5 servicios/repositorios funciona correctamente.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-035

| **ID** | CP-M-035 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService — replaceDocumentFile |
|---|---|---|---|---|---|
| **Nombre** | Reemplazar archivo — sube nuevo, elimina antiguo y actualiza BD e historial |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Documento existente con `googleDriveFileId: 'old-file-id'`
- Carreras asociadas en `careerProofDocument`

**Datos de Prueba:**
- `documentId`: `doc-1`, `file.originalname`: `nuevo-archivo.pdf`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `replaceDocumentFile('doc-1', file, token)` | Servicio obtiene documento actual |
| 2. `careerProofDocument.findMany` obtiene carreras | Para mantener `_carreras.txt` |
| 3. `GoogleDriveService.uploadFile` sube nuevo archivo | Nuevo `fileId` y `url` |
| 4. `GoogleDriveService.deleteFile('old-file-id', ...)` | Archivo antiguo eliminado |
| 5. `this.update(documentId, updateData)` | BD actualizada con nuevos datos |
| 6. `historyService.logChange({ changeType: 'FILE_REPLACED' })` | Cambio registrado |

**Resultado Obtenido:** El test `debe subir el nuevo archivo, eliminar el antiguo y actualizar en BD` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-036

| **ID** | CP-M-036 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService — updateDocumentCareers |
|---|---|---|---|---|---|
| **Nombre** | Actualizar carreras — reemplaza relaciones y actualiza Drive y historial |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Documento con `googleDriveFolderId` y usuario con `googleAccessToken`

**Datos de Prueba:**
- `documentId`: `doc-1`, `careerIds`: `['c1']`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `updateDocumentCareers('doc-1', ['c1'])` | Servicio obtiene documento |
| 2. `careerProofDocument.findMany` — carreras anteriores | Para historial |
| 3. `careerProofDocument.deleteMany` | Todas las relaciones previas eliminadas |
| 4. `careerProofDocument.create` × 1 | Nueva relación creada |
| 5. `career.findMany` obtiene nombres | Para actualizar `_carreras.txt` |
| 6. `googleDriveService.updateCarrerasFile` | Archivo Drive actualizado |
| 7. `historyService.logChange({ changeType: 'CAREERS_UPDATED' })` | Cambio auditado |

**Resultado Obtenido:** El test `debe actualizar _carreras.txt en Drive si el documento tiene folderId y tokens disponibles` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-037

| **ID** | CP-M-037 | **Fecha** | 08/04/2026 | **Módulo** | ProofDocumentsService — searchProofDocuments |
|---|---|---|---|---|---|
| **Nombre** | Búsqueda jerárquica — filtro por dimensionId construye query SINAES complejo |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `prisma.proofDocument.findMany` y `count` mockeados

**Datos de Prueba:**
- `dimensionId`: `dim-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `searchProofDocuments({ dimensionId: 'dim-1' })` | Servicio construye `where` |
| 2. Sin `evidenceId`, se construye filtro jerárquico | `evidence.OR` agregado |
| 3. Filtro cubre ambas rutas posibles | Via criterio directo y via estándar |
| 4. `prisma.proofDocument.findMany` llamado | Con `where` correcto |
| 5. Resultado con meta de paginación | `{ data, meta: { hasNext, hasPrev } }` |

**Resultado Obtenido:** El test `debe filtrar por dimensionId a través de evidence` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-038

| **ID** | CP-M-038 | **Fecha** | 08/04/2026 | **Módulo** | AnnualJourneyTimeAllocationsService — getYearSummary |
|---|---|---|---|---|---|
| **Nombre** | Resumen anual — cálculo correcto de totales por campus y proveedores externos |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.findByYear` retorna asignación con campus y proveedores

**Datos de Prueba:**
- Campus: `allocated=50`, `additional=10`, profesorACTIVE=20, proyectoACTIVE=8
- Proveedor ACTIVE=15, Proveedor INACTIVE=5

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `getYearSummary(2024)` | Servicio calcula por campus |
| 2. `professorConsumed = 20` (solo ACTIVE) | INACTIVE ignorado |
| 3. `projectsConsumed = 8` (solo ACTIVE) | INACTIVE ignorado |
| 4. `available = 50 + 10 - 28 = 32` | Disponible correcto |
| 5. `externalTotal = 15` (solo ACTIVE) | Proveedor INACTIVE ignorado |

**Resultado Obtenido:** El test `debe retornar resumen completo con campusSummary y externalProviders` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-039

| **ID** | CP-M-039 | **Fecha** | 08/04/2026 | **Módulo** | AcademicLoadsService — bulkImportAcademicLoads |
|---|---|---|---|---|---|
| **Nombre** | Importación masiva — crea grupo y schedule nuevos cuando no existen |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Campus, ciclo, curso y profesor existen en BD mock
- Grupo NO existe (`findFirst` retorna `null`)
- Schedule NO existe (`findFirst` retorna `null`)

**Datos de Prueba:**
- `nrc`: `NRC-100`, `grupo`: `G01` (nuevo), `horario`: `L-K 8:00-10:00` (nuevo)

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `bulkImportAcademicLoads([load])` | Flujo completo por registro |
| 2. `academicLoadGroup.findFirst` → `null` | Grupo no existe |
| 3. `academicLoadGroup.create` | Grupo creado, `stats.groupsFound++` |
| 4. `schedule.findFirst` → `null` | Schedule no existe |
| 5. `schedule.create` | Schedule creado, `stats.schedulesCreated++` |
| 6. `academicLoad.create` | Carga creada, `created: 1` |

**Resultado Obtenido:** Los tests `debe crear grupo si no existe` y `debe crear schedule si no existe` pasan. Coordinación entre 7 modelos de Prisma en una sola operación de importación.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-040

| **ID** | CP-M-040 | **Fecha** | 08/04/2026 | **Módulo** | SinaesReportsService |
|---|---|---|---|---|---|
| **Nombre** | generateComplianceReport — genera JSON estructurado de cumplimiento SINAES |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `SinaesReportsService` instanciado con mocks
- BD mock con dimensiones, componentes, criterios, estándares y evidencias

**Datos de Prueba:**
- Carrera evaluada con datos de cumplimiento parcial

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar método de generación de reporte | Servicio consulta jerarquía SINAES |
| 2. Navega Dimensiones → Componentes → Criterios → Estándares → Evidencias | Jerarquía completa recorrida |
| 3. Calcula porcentajes de cumplimiento | Métricas calculadas por nivel |
| 4. Retorna estructura JSON completa | Reporte estructurado con todas las métricas |

**Resultado Obtenido:** El test `Genera el JSON estructurado con el resumen de cumplimiento SINAES` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-041

| **ID** | CP-M-041 | **Fecha** | 08/04/2026 | **Módulo** | SinaesDocumentHistoryService |
|---|---|---|---|---|---|
| **Nombre** | logChange + getDocumentHistory — registra y recupera trazabilidad de documento |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `SinaesDocumentHistoryService` instanciado con mocks

**Datos de Prueba:**
- `documentId`: `doc-1`, `userId`: `user-1`, `changeType`: `UPDATED`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `logChange({ documentId, userId, changeType: 'UPDATED', ... })` | Historial registrado en BD |
| 2. `prisma.sinaesDocumentHistory.create` llamado | Registro persistido |
| 3. Llamar `getDocumentHistory('doc-1')` | Servicio consulta historial |
| 4. Verificar retorno | Lista paginada de cambios del documento |

**Resultado Obtenido:** Los tests `Registra el log de trazabilidad al modificar un documento clave` y `Retorna la trazabilidad paginada` pasan.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-042

| **ID** | CP-M-042 | **Fecha** | 08/04/2026 | **Módulo** | GoogleDriveService — createFolderStructure |
|---|---|---|---|---|---|
| **Nombre** | Crear estructura jerárquica completa en Drive — 5 niveles SINAES |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `@googleapis/drive` y `google-auth-library` mockeados a nivel de módulo
- `drive.files.list` retorna listas vacías (sin carpetas existentes)

**Datos de Prueba:**
- `dimensionCode: 'D-01'`, `componentCode: 'C-01'`, `criterionCode: 'CR-01'`
- `standardCode: 'ST-01'`, `evidenceCode: 'EV-01'`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `createFolderStructure(folderStructure, accessToken)` | Inicia creación jerárquica |
| 2. `drive.files.create` para Dimensión | Carpeta nivel 1 creada |
| 3. `drive.files.create` para Componente (dentro de Dimensión) | Carpeta nivel 2 |
| 4. `drive.files.create` para Criterio | Carpeta nivel 3 |
| 5. `drive.files.create` para Estándar | Carpeta nivel 4 |
| 6. `drive.files.create` para Evidencia | Carpeta nivel 5 |
| 7. Retorna `{ id, path }` | Path refleja jerarquía completa |

**Resultado Obtenido:** El test `debe crear la estructura jerárquica completa y retornar DriveFolder` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-043

| **ID** | CP-M-043 | **Fecha** | 08/04/2026 | **Módulo** | CommissionsService |
|---|---|---|---|---|---|
| **Nombre** | Eliminar comisión — eliminación exitosa sin ninguna relación activa |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `repo.count` retorna `0` para las 4 relaciones: `projects`, `reviews`, `sessions`, `members`

**Datos de Prueba:**
- `id`: `comm-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `deleteById('comm-1')` | Servicio verifica las 4 relaciones |
| 2. `count` retorna `0` en `projects` | Sin proyectos activos |
| 3. `count` retorna `0` en `reviews` | Sin revisiones activas |
| 4. `count` retorna `0` en `sessions` | Sin sesiones activas |
| 5. `count` retorna `0` en `members` | Sin miembros activos |
| 6. `repo.deleteById('comm-1')` | Comisión eliminada exitosamente |

**Resultado Obtenido:** El test `debe eliminar la comisión si no tiene ninguna relación activa` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-044

| **ID** | CP-M-044 | **Fecha** | 08/04/2026 | **Módulo** | UserRolesService |
|---|---|---|---|---|---|
| **Nombre** | updateRolePermissions — actualiza permisos y retorna rol actualizado |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- Rol `r1` existe con permisos iniciales

**Datos de Prueba:**
- `roleId`: `r1`, `permissionIds`: `['p1', 'p2', 'p3']`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `updateRolePermissions('r1', ['p1', 'p2', 'p3'])` | Servicio valida rol |
| 2. Permisos anteriores eliminados | Relaciones previas removidas |
| 3. Nuevos permisos asignados | `p1`, `p2`, `p3` conectados |
| 4. `findRoleWithPermissions` re-lista el rol | Rol actualizado con nuevos permisos |

**Resultado Obtenido:** El test `Actualiza permisos si el rol es válido y hace relist del rol` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

### CP-M-045

| **ID** | CP-M-045 | **Fecha** | 08/04/2026 | **Módulo** | GenericController (Modular) |
|---|---|---|---|---|---|
| **Nombre** | softDelete — marca el registro como inactivo y lo retorna |
| **Tipo de Prueba** | Modular | **Estado** | ✅ PASÓ |

**Precondición:**
- `GenericController` instanciado con mock de `GenericService`
- `service.softDeleteById` retorna registro con `status: INACTIVE`

**Datos de Prueba:**
- `id`: `reg-1`

| **Pasos** | **Resultado Esperado** |
|---|---|
| 1. Llamar `softDelete('reg-1')` | Controlador llama al servicio |
| 2. `service.softDeleteById('reg-1')` | Registro marcado como INACTIVE |
| 3. Verificar retorno | Registro con `status: INACTIVE` |
| 4. Verificar que no se eliminó físicamente | `service.deleteById` no llamado |

**Resultado Obtenido:** El test `debe marcar el registro como inactivo y retornarlo` pasa.

**Prueba ejecutada por:** Francisco Mora Cabezas

---

*Documento generado el 08/04/2026 — Sistema de Gestión de Calidad, Universidad Nacional de Costa Rica*
*Total: 60 pruebas unitarias (CP-U-001 a CP-U-060) | 45 pruebas modulares (CP-M-001 a CP-M-045)*
*Basado en 672 tests pasando — 93 suites ejecutadas exitosamente*
