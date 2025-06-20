import { SetMetadata } from '@nestjs/common';
import { PermissionScope, PermissionType } from '@una-gc/database/prisma/generated/client';

/*
 * Decorator to require specific permissions on a controller or method.
 * Allows you to define the permissions needed to access a route.
 * resource = permission.code (e.g., 'USER', 'CAMPUS')
 * action = PermissionType (e.g., CREATE, READ, UPDATE, DELETE) (enums)
 * scope = PermissionScope (e.g., ALL, OWN) (enums)
 *
 * Usage example:
 * @RequirePermissions({ resource: 'USER', action: PermissionType.READ, scope: PermissionScope.OWN })
 */
export interface RequiredPermission {
  resource: string;
  action: PermissionType;
  scope?: PermissionScope;
}

export const RESOURCE_NAME_TOKEN = '{{RESOURCE_NAME}}';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
