import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useMutation } from '@tanstack/react-query'
import type {
  UserPermission,
  UserPermissionFilters,
  CreateUserPermissionDto,
  UpdateUserPermissionDto
} from '../types/user-permission.types'
import type { PaginatedResponse } from '@/services/interfaces'

const API_RESOURCE_PATH = 'user-permissions'

class UserPermissionService extends GenericService<
  UserPermission,
  CreateUserPermissionDto,
  UpdateUserPermissionDto,
  UserPermissionFilters
> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  // Agregar métodos personalizados si son necesarios
}

// Create an instance of the service
export const userPermissionService = new UserPermissionService()

// Generate generic hooks using the service instance
export const {
  useList: useUserPermissions,
  useOne: useUserPermission,
  useCreate: useCreateUserPermission,
  useUpdate: useUpdateUserPermission,
  useRemove: useDeleteUserPermission
} = createGenericHooks<
  UserPermission,
  CreateUserPermissionDto,
  UpdateUserPermissionDto,
  UserPermissionFilters
>(
  'userPermissions',
  userPermissionService,
  {
    messages: {
      created: (permission) => `Permiso "${permission.name}" creado exitosamente.`,
      updated: (permission) => `Permiso "${permission.name}" actualizado correctamente.`,
      deleted: () => 'Permiso eliminado correctamente.'
    }
  }
)

// Custom hook for paginated permissions
export function useGetPaginatedUserPermissions(filters: UserPermissionFilters) {
  return useUserPermissions(filters)
}

// Default export the service instance
export default userPermissionService