# Cambios en el Manejo de Rol Activo

## Resumen de Cambios

Se ha modificado la forma en que se maneja el rol activo del usuario para seguir el mismo patrón que los JWT tokens:

### Antes

- El rol activo se guardaba en una cookie desde el frontend
- La cookie era accesible desde JavaScript
- No había validación del servidor

### Después

- El rol activo se guarda en una cookie HTTP-only desde el backend
- La cookie no es accesible desde JavaScript (más seguro)
- El servidor valida que el usuario tenga permisos para usar el rol seleccionado

## Nuevos Endpoints

### POST /auth/set-active-role

Establece el rol activo para el usuario actual.

**Request Body:**

```json
{
  "roleId": "507f1f77bcf86cd799439011"
}
```

**Response:**

```json
{
  "message": "Active role set successfully",
  "roleId": "507f1f77bcf86cd799439011"
}
```

### GET /auth/active-role

Obtiene el ID del rol activo actual.

**Response:**

```json
{
  "activeRoleId": "507f1f77bcf86cd799439011"
}
```

## Cambios en el Frontend

### CookieManager

- `setActiveRole()` ahora es async y llama al endpoint del backend
- `getActiveRoleId()` siempre devuelve null (cookie HTTP-only)
- `hasActiveRole()` verifica SessionStorage en lugar de cookies

### AuthService

- Nuevos métodos `setActiveRole()` y `getActiveRole()`
- Manejo de errores mejorado

### Middleware

- Ahora lee la cookie `active_role_id` en lugar de `user_active_role_id`
- Sigue funcionando igual para las validaciones

## Flujo de Uso

1. Usuario selecciona un rol en el frontend
2. Frontend llama a `CookieManager.setActiveRole(role)`
3. `CookieManager` llama a `AuthService.setActiveRole(roleId)`
4. `AuthService` hace POST a `/auth/set-active-role`
5. Backend valida que el usuario puede usar ese rol
6. Backend establece cookie HTTP-only `active_role_id`
7. Middleware del frontend puede leer la cookie para validaciones

## Beneficios de Seguridad

- Cookie HTTP-only previene acceso desde JavaScript malicioso
- Validación del servidor asegura que el usuario tenga permisos
- Consistencia con el patrón de JWT tokens
- Menor superficie de ataque en el frontend

## Compatibilidad

- El middleware sigue funcionando normalmente
- Los componentes que usan `SessionStorageManager` siguen funcionando
- Solo cambió la implementación interna de `CookieManager`
