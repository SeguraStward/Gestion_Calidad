import { PermissionType, PermissionScope } from '@una-gc/database/prisma/generated/client'

// User status enum para manejar el estado del usuario
export const UserStatus = {
  PRE_REGISTRATION: 'PRE_REGISTRATION',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

// Tipo para el perfil básico del usuario
export type UserProfile = {
  id: string
  name: string
  email: string
  fullName?: string
  fullLastName?: string
  photoUrl: string | null
  status: UserStatus
  needsProfileCompletion?: boolean
}

// special tytpe (modifiqueted)
export type Permission = {
  id: string
  name: string
  code: string
  status: string
  type: PermissionType[]
  actions: string[]
  scope: PermissionScope
}

// especial Role type (modifiqueted)
export type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

// response expected from the API
export type UserRolesResponse = Role[]
