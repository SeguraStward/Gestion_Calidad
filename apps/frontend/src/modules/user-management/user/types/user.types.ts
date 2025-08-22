/**
 * Type definitions for users
 */

import { UserRole } from '../../user-role/types/user-role.types'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PRE_REGISTRATION'

export interface User {
  id: string
  email: string
  fullName: string
  fullLastName?: string
  photoUrl?: string
  status: UserStatus
  roleIds: string[]
  roles?: UserRole[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserDto {
  email: string
  fullName: string
  fullLastName?: string
  photoUrl?: string
  status?: UserStatus
  roleIds?: string[]
}

export interface UpdateUserDto extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
}

// Alternative interface for hook usage (id + data structure)
export interface UpdateUserPayload {
  id: string
  data: UpdateUserDto
}

export interface UserFilters {
  search?: string
  status?: UserStatus | 'ALL'
  role?: string
  page?: number
  limit?: number
  sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}