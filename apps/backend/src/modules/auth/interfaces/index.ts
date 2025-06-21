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
  picture?: string | null;
}

export interface UserBasicInfo {
  id: string;
  email: string;
  fullName: string;
  fullLastName?: string;
  profilePicture?: string | null;
  status: string;
}
