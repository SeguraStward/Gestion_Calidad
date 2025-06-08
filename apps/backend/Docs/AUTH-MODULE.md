# Documentación del Módulo de Autenticación

## Descripción General

El módulo de autenticación (`auth`) proporciona un sistema completo de autenticación y autorización para la aplicación, implementando múltiples estrategias de autenticación, gestión de tokens JWT, y un sistema granular de permisos basado en roles.

## Arquitectura del Módulo

### Componentes Principales

#### 1. AuthModule (`auth.module.ts`)

**Responsabilidad**: Configuración y registro de dependencias del módulo de autenticación.

**Características**:

- Integra Passport.js para estrategias de autenticación
- Configura JWT Module de forma asíncrona
- Registra estrategias: Google OAuth, JWT, y JWT Refresh
- Exporta AuthService para uso en otros módulos

**Dependencias**:

- `PrismaModule`: Para acceso a la base de datos
- `PassportModule`: Framework de autenticación
- `ConfigModule`: Gestión de variables de entorno
- `JwtModule`: Manejo de tokens JWT

#### 2. AuthController (`auth.controller.ts`)

**Responsabilidad**: Exposición de endpoints HTTP para operaciones de autenticación.

**Endpoints principales**:

- `GET /auth/google/login`: Inicia el flujo OAuth de Google
- `GET /auth/google/callback`: Maneja la respuesta del proveedor OAuth
- `POST /auth/refresh`: Renovación de tokens de acceso
- `POST /auth/logout`: Cierre de sesión y revocación de tokens

**Características**:

- Validación de dominio institucional (`@est.una.ac.cr`)
- Gestión de cookies HTTP-only para seguridad
- Manejo de errores con códigos estandarizados
- Redirección inteligente basada en el estado de autenticación

#### 3. AuthService (`auth.service.ts`)

**Responsabilidad**: Lógica de negocio para autenticación y gestión de tokens.

**Funcionalidades principales**:

- **Autenticación Google**: Verificación de usuarios OAuth y sincronización con BD
- **Gestión de tokens JWT**: Generación de access tokens y refresh tokens
- **Seguridad de tokens**: Hash de refresh tokens para almacenamiento seguro
- **Validación de usuarios**: Verificación de estado de cuenta (activo/inactivo)
- **Revocación de tokens**: Invalidación segura durante logout

**Métodos clave**:

- `googleLogin()`: Autenticación completa con Google OAuth
- `generateAccessToken()`: Creación de tokens de acceso
- `generateAndStoreRefreshToken()`: Generación y almacenamiento de refresh tokens
- `refreshToken()`: Renovación de tokens expirados
- `revokeRefreshToken()`: Revocación segura de tokens

## Estrategias de Autenticación

### 1. Google OAuth Strategy (`strategies/google-strategy.ts`)

**Propósito**: Autenticación mediante cuentas de Google institucionales.

**Configuración**:

- Client ID y Secret configurables via variables de entorno
- Callback URL configurable
- Scopes: email y profile
- Validación automática de dominio institucional

**Proceso**:

1. Redirección a Google OAuth
2. Validación de credenciales
3. Retorno con datos del usuario
4. Verificación de dominio institucional

### 2. JWT Strategy (`strategies/jwt-strategy.ts`)

**Propósito**: Validación de tokens de acceso para rutas protegidas.

**Características**:

- Extracción de tokens desde cookies HTTP-only
- Validación de integridad y expiración
- Carga de datos de usuario con roles activos
- Manejo de errores de usuario no encontrado

**Datos del usuario incluidos**:

- ID, email, nombre completo
- Estado de la cuenta
- Roles activos del usuario

### 3. JWT Refresh Strategy (`strategies/jwt-refresh.strategy.ts`)

**Propósito**: Validación de refresh tokens para renovación de acceso.

**Seguridad**:

- Verificación de tokens en base de datos
- Validación de expiración y estado
- Prevención de reutilización de tokens

## Sistema de Autorización

### 1. Decoradores de Permisos

#### @RequirePermissions (`decorators/require-permissions.decorator.ts`)

**Propósito**: Definir permisos requeridos para acceder a endpoints.

**Estructura**:

```typescript
interface RequiredPermission {
  resource: string; // Código del recurso (ej: 'USER', 'CAMPUS')
  action: PermissionType; // Tipo de acción (CREATE, READ, UPDATE, DELETE)
  scope?: PermissionScope; // Alcance (ALL, OWN)
}
```

**Ejemplo de uso**:

```typescript
@RequirePermissions({
  resource: 'USER',
  action: PermissionType.READ,
  scope: PermissionScope.OWN
})
```

#### @ResourceName (`decorators/resource-name.decorator.ts`)

**Propósito**: Definir el nombre del recurso para resolución dinámica de permisos.

### 2. Guards de Seguridad

#### PermissionsGuard (`guards/permissions.guard.ts`)

**Responsabilidad**: Verificación en tiempo de ejecución de permisos de usuario.

**Proceso de validación**:

1. Extracción de permisos requeridos del endpoint
2. Verificación de autenticación del usuario
3. Resolución de permisos del usuario desde BD
4. Validación de permisos específicos
5. Aplicación de reglas de alcance (ALL vs OWN)

**Características**:

- Bypass configurable via variable de entorno (`DISABLED_ROLES=true`)
- Logging detallado para auditoría
- Manejo de recursos dinámicos con tokens
- Soporte para múltiples permisos por endpoint

#### Otros Guards

- **JwtAuthGuard**: Protección con tokens de acceso
- **JwtRefreshGuard**: Validación de refresh tokens
- **GoogleAuthGuard**: Manejo del flujo OAuth

## Interfaces y Tipos

### GoogleUser Interface

```typescript
interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  familyName?: string;
  fullLastName?: string;
  picture?: string;
}
```

### Permission Interface

```typescript
interface Permission {
  permissionID: string;
  permissions: PermissionType[];
  scope: PermissionScope | null;
  actions: string[];
}
```

## Flujos de Autenticación

### 1. Flujo OAuth Google

1. Usuario accede a `/auth/google/login`
2. Redirección a Google OAuth
3. Usuario autentica en Google
4. Callback a `/auth/google/callback`
5. Validación de dominio institucional
6. Verificación/creación de usuario en BD
7. Generación de tokens JWT
8. Establecimiento de cookies seguras
9. Redirección a selección de rol

### 2. Flujo de Refresh Token

1. Token de acceso expira
2. Cliente envía refresh token
3. Validación del refresh token
4. Marcado como usado en BD
5. Generación de nuevos tokens
6. Retorno de tokens actualizados

### 3. Flujo de Logout

1. Cliente solicita logout
2. Extracción de refresh token
3. Marcado como revocado en BD
4. Limpieza de cookies
5. Confirmación de logout

## Seguridad Implementada

### 1. Gestión de Tokens

- **Access Tokens**: Corta duración, almacenados en memoria
- **Refresh Tokens**: Larga duración, hasheados en BD
- **Rotación**: Refresh tokens se invalidan después del uso
- **Revocación**: Logout invalida todos los tokens del usuario

### 2. Cookies Seguras

- **HTTP-Only**: Previene acceso desde JavaScript
- **Secure**: Solo HTTPS en producción
- **SameSite**: Protección CSRF
- **Expiración**: Configurada según duración de tokens

### 3. Validaciones

- **Dominio institucional**: Solo emails `@est.una.ac.cr`
- **Estado de cuenta**: Verificación de usuarios activos
- **Integridad de tokens**: Validación criptográfica
- **Permisos granulares**: Control de acceso por recurso y acción

## Configuración Requerida

### Variables de Entorno

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# Application URLs
FRONTEND_URL=http://localhost:3001

# Development
NODE_ENV=development
DISABLED_ROLES=false
```

## Consideraciones de Implementación

### 1. Escalabilidad

- Tokens stateless para distribución horizontal
- Refresh tokens en BD para revocación inmediata
- Separación de concerns entre autenticación y autorización

### 2. Mantenibilidad

- Decoradores reutilizables para permisos
- Estrategias modulares de Passport
- Configuración centralizada via ConfigService

### 3. Auditoría

- Logging detallado de operaciones de autenticación
- Rastreo de uso de tokens
- Registro de intentos de acceso denegado

## Integración con Otros Módulos

El módulo de autenticación se integra con:

- **Core Module**: Para interceptors y filters HTTP
- **Prisma Module**: Para persistencia de datos
- **User Module**: Para gestión de usuarios y roles
- **Audit Module**: Para registro de actividades
