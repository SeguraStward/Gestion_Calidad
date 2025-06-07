// interfaces for authentication module in backend
import { $Enums } from '@una-gc/database/prisma/generated/client';

export interface Permission {
  permissionID: string;
  permissions: $Enums.PermissionType[];
  scope: $Enums.PermissionScope | null;
  actions: string[];
}

export interface SelectedRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Permission[];
}

export interface JwtPayload {
  sub: string; // ID del usuario
  email: string; // Email del usuario
  role?: SelectedRole; // Rol seleccionado (opcional porque al inicio no tiene rol)
  iat?: number; // Issued At (cuándo se creó el token)
  exp?: number; // Expiration Time (cuándo expira)
}

export interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  familyName?: string;
  fullLastName?: string;
  picture?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    fullLastName?: string;
    profilePicture?: string;
    role?: SelectedRole;
  };
  token: string;
  refreshToken?: string;
}

export interface UserFromJwt {
  id: string;
  email: string;
  role?: SelectedRole;
}
