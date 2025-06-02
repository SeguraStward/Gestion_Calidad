import { SetMetadata } from '@nestjs/common';
import { PermissionScope, PermissionType } from '@una-gc/database/prisma/generated/client';

export interface RequiredPermission {
  resource: string; // El código de la entidad (UserPermission.code)
  action: PermissionType; // CREATE, READ, UPDATE, DELETE
  scope?: PermissionScope; // ALL, OWN
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
