import { GenericService } from '@/services/base/generic.service'

export interface UserRole {
  id: string
  name: string
  description?: string
  status: string
}

export interface CreateUserRoleInput {
  name: string
  description?: string
  permissions: any[]
  status?: string
}

export interface UpdateUserRoleInput extends Partial<CreateUserRoleInput> {}

export class UserRoleService extends GenericService<UserRole, CreateUserRoleInput, UpdateUserRoleInput, Record<string, any>> {
  constructor() {
    super('user-roles')
  }
}

export const userRoleService = new UserRoleService()
