# Documentación del Módulo Core

## Descripción General

El módulo `core` constituye la infraestructura fundamental de la aplicación, proporcionando componentes reutilizables, utilidades comunes y patrones estandarizados que dan soporte a toda la arquitectura del sistema. Este módulo implementa principios de diseño como DRY (Don't Repeat Yourself) y SoC (Separation of Concerns).

## Arquitectura del Core

### Estructura de Directorios

```txt
core/
├── common/          # Componentes y utilidades de uso general
│   ├── decorators/  # Decoradores reutilizables
│   ├── interfaces/  # Interfaces y tipos compartidos
│   ├── repositories/# Implementaciones de repositorios genéricos
│   ├── utils/       # Funciones de utilidad
│   └── dto-validator.ts
└── http/           # Componentes específicos para HTTP
    ├── exceptions/ # Excepciones personalizadas
    ├── filters/    # Filtros de excepción
    ├── guards/     # Guards de protección
    ├── interceptors/# Interceptors de solicitud/respuesta
    ├── interfaces/ # Interfaces HTTP
    └── middlewares/# Middlewares personalizados
```

## Módulo Common

### 1. DtoValidator (`dto-validator.ts`)

**Responsabilidad**: Validación centralizada y transformación de objetos de transferencia de datos (DTOs).

**Características**:

- Validación automática usando class-validator
- Transformación de tipos con class-transformer
- Logging detallado de errores de validación
- Manejo robusto de excepciones

**Método principal**:

```typescript
async validate<T extends object>(payload: T, DtoClass: new () => T): Promise<T>
```

**Funcionalidades**:

- Conversión de plain objects a instancias de clase
- Validación de constrains definidos en DTOs
- Generación de errores estructurados
- Debug logging para troubleshooting

### 2. Repositorios Genéricos

#### GenericPrismaRepository (`repositories/generic-prisma.repository.ts`)

**Responsabilidad**: Implementación base para repositorios que interactúan con Prisma ORM.

**Características**:

- Operaciones CRUD genéricas y reutilizables
- Paginación automática configurable
- Filtrado seguro de campos válidos
- Manejo de relaciones (includes) configurables
- Logging interno para debugging

**Métodos principales**:

**findAll()**:

- Paginación configurable (page, limit)
- Filtrado WHERE dinámico
- Ordenamiento personalizable
- Inclusión de relaciones opcional
- Respuesta paginada estructurada

**findById()**:

- Búsqueda por identificador único
- Inclusión de relaciones opcional
- Manejo de entidades no encontradas

**create()**:

- Creación de nuevas entidades
- Validación de datos de entrada
- Retorno de entidad creada

**update()**:

- Actualización de entidades existentes
- Verificación de existencia previa
- Merge de datos parciales

**delete()**:

- Eliminación por identificador
- Verificación de existencia
- Soft delete opcional

### 3. Utilidades Comunes

#### Audit Fields Util (`utils/audit-fields.util.ts`)

**Propósito**: Gestión automática de campos de auditoría.

**Funcionalidades**:

- Timestamps automáticos (createdAt, updatedAt)
- Tracking de usuario creador/modificador
- Integración con interceptors y guards

#### Prisma Include Parser (`utils/prisma-include.parser.ts`)

**Propósito**: Parsing y validación de parámetros de inclusión de relaciones.

**Características**:

- Conversión de query parameters a objetos include
- Validación de relaciones permitidas
- Prevención de includes maliciosos

## Módulo HTTP

### 1. Middlewares

#### LoggerMiddleware (`middlewares/logger.middleware.ts`)

**Responsabilidad**: Logging comprehensivo de solicitudes HTTP.

**Características**:

- Logging de inicio y finalización de requests
- Medición de tiempo de respuesta
- Información de estado HTTP
- Datos de debugging opcionales
- Emojis para identificación visual rápida

**Métricas capturadas**:

- Método HTTP y URL
- Código de estado de respuesta
- Tamaño de respuesta en bytes
- Tiempo de procesamiento en ms
- IP del cliente y User-Agent (en debug)

#### HttpDebugMiddleware (`middlewares/http-debug.middleware.ts`)

**Responsabilidad**: Logging detallado para debugging en desarrollo.

### 2. Interceptors

#### HttpResponseInterceptor (`interceptors/http-response.interceptor.ts`)

**Responsabilidad**: Estandarización de respuestas HTTP de la aplicación.

**Funcionalidades**:

- Formato uniforme de respuestas exitosas
- Manejo especial para operaciones DELETE
- Metadatos de paginación automáticos
- Estructura consistente de respuesta

**Formato de respuesta estandarizado**:

```typescript
{
  data: T | T[],           // Datos de la respuesta
  meta?: {                 // Metadatos (solo para GET con paginación)
    limit: number,
    page: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

#### SnakeCaseInterceptor (`interceptors/snake-case.interceptor.ts`)

**Responsabilidad**: Conversión automática entre camelCase y snake_case.

#### AuditFieldsInterceptor (`interceptors/audit-fields.interceptor.ts`)

**Responsabilidad**: Inyección automática de campos de auditoría en operaciones CUD.

### 3. Filtros de Excepción

#### ErrorResponseFilter (`filters/error-response.filter.ts`)

**Responsabilidad**: Manejo centralizado y estandarización de errores HTTP.

**Características**:

- Captura de todas las excepciones no manejadas
- Formato uniforme de respuestas de error
- Extracción inteligente de mensajes de error
- Códigos de error estandarizados
- Logging de errores para debugging

**Formato de error estandarizado**:

```typescript
{
  errors: {
    code: string,           // Código de error estandarizado
    title: string,          // Mensaje principal del error
    details?: {             // Detalles adicionales (validaciones)
      [field]: string[]
    }
  }
}
```

#### ValidationExceptionFilter (`filters/validation-exception.filter.ts`)

**Responsabilidad**: Manejo específico de errores de validación de DTOs.

### 4. Guards

#### AuditFieldsGuard (`guards/audit-fields.guard.ts`)

**Responsabilidad**: Protección y validación de campos de auditoría.

**Funcionalidades**:

- Prevención de manipulación manual de campos de auditoría
- Validación de permisos para modificar metadatos
- Inyección automática de datos de usuario autenticado

### 5. Excepciones Personalizadas

#### AlreadyExistsException (`exceptions/already-exists.exception.ts`)

**Propósito**: Excepción para conflictos de entidades duplicadas.

#### CouldNotCreateException (`exceptions/could-not-create.exception.ts`)

**Propósito**: Excepción para fallos en creación de entidades.

### 6. Interfaces HTTP

#### SuccessResponse (`interfaces/success-response.interface.ts`)

```typescript
interface SuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}
```

#### ErrorResponse (`interfaces/error-response.interface.ts`)

```typescript
interface ErrorResponse {
  errors: {
    code: string;
    title: string;
    details?: Record<string, string[]>;
  };
}
```

#### PaginatedResponse (`interfaces/paginated-response.interface.ts`)

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Patrones Implementados

### 1. Repository Pattern

- Abstracción de la capa de datos
- Implementación genérica reutilizable
- Separación entre lógica de negocio y acceso a datos
- Facilita testing y mocking

### 2. Interceptor Pattern

- Procesamiento transversal de solicitudes/respuestas
- Separación de concerns cross-cutting
- Composición de funcionalidades mediante cadena de interceptors

### 3. Filter Pattern

- Manejo centralizado de excepciones
- Transformación consistente de errores
- Logging y auditoría automática

### 4. Middleware Pattern

- Procesamiento secuencial de solicitudes
- Funcionalidades transversales (logging, cors, etc.)
- Composición flexible de pipeline de procesamiento

## Beneficios de la Arquitectura Core

### 1. Reutilización

- Componentes genéricos utilizables en múltiples módulos
- Reducción de código duplicado
- Patrones consistentes en toda la aplicación

### 2. Mantenibilidad

- Centralización de lógica común
- Fácil modificación de comportamientos transversales
- Testing simplificado mediante abstracciones

### 3. Escalabilidad

- Arquitectura modular y extensible
- Separación clara de responsabilidades
- Facilita adición de nuevas funcionalidades

### 4. Consistencia

- Formatos estandarizados de respuesta y error
- Logging uniforme en toda la aplicación
- Patrones de validación consistentes

## Integración con Otros Módulos

### Con Auth Module

- Guards de auditoría utilizan información de usuario autenticado
- Interceptors inyectan datos de usuario en campos de auditoría
- Filtros manejan excepciones de autorización

### Con Feature Modules

- Repositorios genéricos extendidos por repositories específicos
- DTOs validados centralizadamente
- Respuestas HTTP estandarizadas automáticamente

### Con Database Module

- Integración nativa con Prisma ORM
- Parsing seguro de queries y relaciones
- Gestión automática de transacciones (donde aplicable)

## Configuración y Uso

### Variables de Entorno Relevantes

```bash
# Logging
LOG_LEVEL=debug|info|warn|error
HTTP_DEBUG=true|false

# Database
DATABASE_URL=postgresql://...

# Development
NODE_ENV=development|production
```

### Ejemplo de Uso en Feature Module

```typescript
// En un servicio específico
@Injectable()
export class UserService extends GenericPrismaRepository<User, CreateUserDto, UpdateUserDto, { id: string }> {
  protected readonly modelName = 'user';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Métodos específicos del dominio...
}

// En un controlador
@Controller('users')
@UseInterceptors(HttpResponseInterceptor)
@UseFilters(ErrorResponseFilter)
export class UserController {
  // Endpoints con respuestas estandarizadas automáticamente
}
```

## Consideraciones de Performance

### 1. Repositorios

- Lazy loading de relaciones
- Paginación obligatoria para grandes datasets
- Filtrado a nivel de base de datos

### 2. Interceptors

- Procesamiento asíncrono donde es posible
- Caching de transformaciones costosas
- Logging configurable por ambiente

### 3. Middlewares

- Orden optimizado de ejecución
- Bypass de logging en health checks
- Compresión automática de respuestas grandes
