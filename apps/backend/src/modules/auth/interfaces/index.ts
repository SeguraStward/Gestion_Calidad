// interfaces for authentication module in backend

import { PermissionType, PermissionScope } from '@una-gc/database/prisma/generated/client';

export interface Permission {
  permissionID: string;
  permissions: PermissionType[];
  scope: PermissionScope | null;
  actions: string[];
}

export interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  familyName?: string;
  fullLastName?: string;
  picture?: string;
}
