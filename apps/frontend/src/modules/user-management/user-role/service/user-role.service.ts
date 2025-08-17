// Crear: /modules/user-management/user-role/service/user-role.service.ts
import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useQuery, useMutation } from '@tanstack/react-query'
import type {
  UserRole,
  UserRoleFilters,
  CreateUserRoleDto,
  UpdateUserRoleDto
} from '../types/user-role.types'
import type { PaginatedResponse } from '@/services/interfaces'

const API_RESOURCE_PATH = 'user-roles'

class UserRoleService extends GenericService<
  UserRole,
  CreateUserRoleDto,
  UpdateUserRoleDto,
  UserRoleFilters
> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  // Métodos personalizados para roles
  async getRolePermissions(roleId: string) {
    return HttpClient.get<any>(`${this.resource}/roles-permissions/${roleId}`).then(res => res.data)
  }
}

export const userRoleService = new UserRoleService()

export const {
  useList: useUserRoles,
  useOne: useUserRole,
  useCreate: useCreateUserRole,
  useUpdate: useUpdateUserRole,
  useRemove: useDeleteUserRole
} = createGenericHooks<
  UserRole,
  CreateUserRoleDto,
  UpdateUserRoleDto,
  UserRoleFilters
>(
  'userRoles',
  userRoleService,
  {
    messages: {
      created: (role: UserRole) => `Rol "${role.name}" creado exitosamente.`,
      updated: (role: UserRole) => `Rol "${role.name}" actualizado correctamente.`,
      deleted: () => 'Rol eliminado correctamente.'
    }
  }
)

export function useGetPaginatedUserRoles(filters: UserRoleFilters) {
  return useUserRoles(filters)
}

export function useGetAllUserRoles() {
  return useUserRoles({ limit: 1000 })
}

export function useGetRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => userRoleService.getRolePermissions(roleId),
    enabled: !!roleId
  })
}

export function useUpdateRolePermissions() {
  return useMutation({
    mutationFn: (payload: { roleId: string, permissions: any[] }) =>
      HttpClient.patch(`${API_RESOURCE_PATH}/${payload.roleId}/permissions`, { permissions: payload.permissions })
        .then(res => res.data)
  })
}

export default userRoleService