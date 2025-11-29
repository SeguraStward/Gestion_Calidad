// Enums
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PRE_REGISTRATION = 'PRE_REGISTRATION'
}

// Añadir PermissionType enum
export enum PermissionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  REPORT = 'REPORT'
}

export enum PermissionScope {
  ALL = 'ALL',
  OWN = 'OWN'
}

// User profile matching backend UserResponseDto
export interface UserBasicInfo {
  id: string
  email: string
  fullName: string
  fullLastName?: string | null
  photoUrl?: string | null
  status: UserStatus
}

// Cookie presence detection (since cookies are HttpOnly)
export interface CookiePresence {
  hasAuthToken: boolean
  hasRefreshToken: boolean
  hasActiveRole: boolean
  isAuthenticated: boolean
}

// Complete profile data
export interface CompleteProfileData {
  fullName: string
  fullLastName: string
  phoneNumber?: string
}

// Role and permission types
export interface Permission {
  id: string;
  name: string;
  code: string;
  status: Status;
  type: PermissionType[];
  scope: PermissionScope;
  actions: string[]; // Campo nuevo que usa el frontend
  permissions?: string[]; // Campo legacy de la base de datos (compatible con estructura antigua)
}

export interface Role {
  id: string
  name: string
  description: string
  status: Status
  permissions: Permission[]
}

export type UserRolesResponse = Role[]

// Auth error types
export interface AuthError {
  code: string
  message: string
  action?: string
}
