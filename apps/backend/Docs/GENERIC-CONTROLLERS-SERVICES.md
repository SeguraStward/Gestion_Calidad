# Resumen: Controladores y Servicios Genéricos

## ¿Qué son?

Abstracciones para implementar operaciones CRUD estándar en NestJS, reutilizables y seguras, con soporte para paginación, filtrado, relaciones, autorización y soft delete.

## Componentes Principales

### GenericController<D, C, U = Partial<C>>

- **D**: DTO de respuesta, **C**: DTO de creación, **U**: DTO de actualización
- Clase abstracta para endpoints REST CRUD con guards automáticos (`JwtAuthGuard`, `AuditFieldsGuard`)
- **7 endpoints**: `GET /`, `GET /count`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/soft-delete`
- Soporta paginación, filtros, ordenamiento y relaciones incluibles
- Autorización granular por acción (`READ`, `CREATE`, `UPDATE`, `DELETE`)

### GenericService<E, D, C, U>

- **E**: Entidad de BD, **D**: DTO respuesta, **C**: DTO creación, **U**: DTO actualización
- Clase abstracta para lógica de negocio CRUD con transformación automática de DTOs
- **Métodos principales**: findAll, findById, findOne, count, save, update, deleteById, softDeleteById
- **Helpers privados**: `transformDto()`, `createIncludeRelations()`, `checkActiveRelations()`
- Validación automática con `class-transformer` y `DtoValidator`
- Verificación configurable de relaciones antes de eliminar

### Configuración de Relaciones

```typescript
protected relationCheckConfig = {
  relationFields: ['users', 'posts', 'comments'],
  errorMessage: 'Cannot delete: has active related records'
};
```

### Decoradores de Autorización

- `@AuthorizedEndpoint(PermissionType)`: Combina `@ApiBearerAuth`, `@UseGuards(PermissionsGuard)`, `@RequirePermissions`
- `@CommonApiQueries`: Documenta parámetros reutilizables (`include`, `orderBy`)

## Implementación Básica

1. **Controlador**: Hereda de `GenericController<D, C, U>`, define `@ResourceName` y servicio
2. **Servicio**: Hereda de `GenericService<E, D, C, U>`, configura repositorio, DTOs y validaciones

## Ejemplos de Uso

### Controlador Básico

```typescript
@ResourceName('USER')
@Controller('users')
export class UsersController extends GenericController<UserDto, CreateUserDto, UpdateUserDto> {
  protected readonly logger = new Logger(UsersController.name);
  protected readonly resourceName = 'USER';

  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
}
```

### Servicio con Configuración

```typescript
@Injectable()
export class UsersService extends GenericService<User, UserDto, CreateUserDto, UpdateUserDto> {
  protected readonly logger = new Logger(UsersService.name);

  // Verificación de relaciones
  protected relationCheckConfig = {
    relationFields: ['posts', 'comments'],
    errorMessage: 'Cannot delete user: has related content',
  };

  // Personalización de soft delete
  protected getSoftDeletePayload(): Partial<UpdateUserDto> {
    return { status: 'INACTIVE', deletedAt: new Date() };
  }
}
```

### Consultas HTTP Ejemplo

```bash
# Listar con filtros y paginación
GET /users?page=1&limit=10&status=ACTIVE&orderBy={"name":"asc"}&include=roles,permissions

# Obtener por ID con relaciones
GET /users/123?include=roles

# Crear usuario
POST /users
{"email":"user@example.com","fullName":"Juan Pérez"}
```

## Mejores Prácticas

- Nomenclatura consistente.
- DTOs específicos.
- Logging sin datos sensibles.
- Permisos granulares.
- Verificar relaciones antes de eliminar.
- Uso correcto de filtros y paginación.
- Dejar manejo de errores estándar a NestJS.

## Códigos de Estado HTTP

| Método                   | Éxito            | Error Común        |
| ------------------------ | ---------------- | ------------------ |
| `GET /`                  | `200 OK`         | `401 Unauthorized` |
| `GET /:id`               | `200 OK`         | `404 Not Found`    |
| `POST /`                 | `201 Created`    | `400 Bad Request`  |
| `PUT /:id`               | `200 OK`         | `404 Not Found`    |
| `DELETE /:id`            | `204 No Content` | `409 Conflict`     |
| `PATCH /:id/soft-delete` | `200 OK`         | `404 Not Found`    |

---

**Conclusión:**  
Este sistema centraliza y estandariza la lógica CRUD, acelerando el desarrollo, mejorando la seguridad y facilitando el mantenimiento y la extensión de la aplicación.
