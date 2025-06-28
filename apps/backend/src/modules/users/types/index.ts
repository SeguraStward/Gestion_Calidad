import { EnrichedPermissions } from '@src/modules/user-roles/types';
import { Status } from '@una-gc/database/prisma/generated/client';

// ** Responses of APi **
export interface SimpleRoleWithPermissions {
  id: string;
  name: string;
  status: Status;
  description: string;
  permissions: EnrichedPermissions[];
}

export interface SimpleUserRole {
  id: string;
  name: string;
  status: Status;
  description: string;
}
