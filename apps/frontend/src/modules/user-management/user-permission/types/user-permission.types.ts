
export type UserPermissionStatus = 'ACTIVE' | 'INACTIVE'

export interface UserPermission {
  id: string
  name: string
  code: string
  description?: string
  status: UserPermissionStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserPermissionDto {
  name: string
  code: string
  description?: string
  status?: UserPermissionStatus
}

export interface UpdateUserPermissionDto extends Partial<Omit<UserPermission, 'id' | 'createdAt' | 'updatedAt'>> {
}

// Alternative interface for hook usage (id + data structure)
export interface UpdateUserPermissionPayload {
  id: string
  data: UpdateUserPermissionDto
}

export interface UserPermissionFilters {
  search?: string
  status?: UserPermissionStatus | 'ALL'
  page?: number
  limit?: number
}