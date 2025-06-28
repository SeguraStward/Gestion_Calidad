import { AuditFields } from '@src/types';
import { PermissionScope, PermissionType, Status } from '@una-gc/database/prisma/generated/client';

// ** Responses of APi **
// Role and permission types. special type (modified)
export interface EnrichedPermissions {
  id: string;
  name: string;
  code: string;
  status: Status;
  type: PermissionType[];
  scope: PermissionScope;
  actions: string[];
}

export interface RoleWithPermissions extends AuditFields {
  id: string;
  name: string;
  status: Status;
  description: string;
  permissions: EnrichedPermissions[];
}

export interface SimpleUserPermission {
  id: string;
  name: string;
  code: string;
  status: Status;
}
