/**
 * Type definitions for user roles
 */

import { Permission, PermissionType, PermissionScope } from '@/modules/auth/types'

export type UserRoleStatus = 'ACTIVE' | 'INACTIVE'

export interface SimpleUserPermission {
  id: string
  name: string
  code: string
  status: 'ACTIVE' | 'INACTIVE'
}

// Permission assignment for role creation (what we send to backend)
export interface RolePermissionAssignment {
  permissionID: string
  permissions: PermissionType[]
  scope: PermissionScope
  actions: string[]
}

export interface UserRole {
  id: string
  code?: string // Make optional in case backend doesn't always send it
  name: string
  description?: string
  status?: UserRoleStatus // Make optional to handle malformed responses
  permissions?: Permission[]
  createdAt?: string
  updatedAt?: string

  // Alternative status representations that backend might use
  state?: UserRoleStatus
  active?: boolean
  enabled?: boolean
}

export interface CreateUserRoleDto {
  name: string
  description?: string
  status: UserRoleStatus
  permissions?: RolePermissionAssignment[]
}

export interface UpdateUserRoleDto extends Partial<Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>> {
}

// Alternative interface for hook usage (id + data structure)
export interface UpdateUserRolePayload {
  id: string
  data: UpdateUserRoleDto
}

export interface UserRoleFilters {
  search?: string
  status?: UserRoleStatus | 'ALL'
  page?: number
  limit?: number
}