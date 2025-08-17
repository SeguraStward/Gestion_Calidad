/**
 * Type definitions for user roles
 */

import { Permission } from '@/modules/auth/types'

export type UserRoleStatus = 'ACTIVE' | 'INACTIVE'

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
  code: string
  name: string
  description?: string
  status: UserRoleStatus
  permissionIds?: string[]
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