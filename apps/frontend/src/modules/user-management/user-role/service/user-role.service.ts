// Crear: /modules/user-management/user-role/service/user-role.service.ts
import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useQuery, useMutation } from '@tanstack/react-query'
import type {
  UserRole,
  UserRoleFilters,
  CreateUserRoleDto,
  UpdateUserRoleDto,
  SimpleUserPermission
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

  // Custom delete method with better error handling and debugging
  async deleteRole(id: string): Promise<void> {
    try {
      console.log('🗑️ Attempting to delete role with ID:', id)
      console.log('🔍 ID type:', typeof id)
      console.log('🔍 ID length:', id?.length)

      if (!id) {
        throw new Error('ID del rol es requerido para eliminar')
      }

      if (typeof id !== 'string') {
        throw new Error('ID del rol debe ser una cadena de texto')
      }

      if (id.trim() === '') {
        throw new Error('ID del rol no puede estar vacío')
      }

      // Clean the ID to remove any potential whitespace or special characters
      const cleanId = id.trim()
      console.log('🧹 Cleaned ID:', cleanId)

      const url = `/${this.resource}/${cleanId}`
      console.log('📡 Delete URL:', url)

      const response = await HttpClient.delete(url)
      console.log('✅ Role deleted successfully:', response)
    } catch (err: any) {
      console.error('❌ Error deleting role:', err)
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      })

      // Enhanced error handling
      if (err.response?.data?.message) {
        throw new Error(`Error del servidor: ${err.response.data.message}`)
      } else if (err.response?.data?.error) {
        throw new Error(`Error del servidor: ${err.response.data.error}`)
      } else if (err.response?.status === 404) {
        throw new Error('El rol no fue encontrado')
      } else if (err.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar este rol')
      } else if (err.response?.status === 409) {
        throw new Error('No se puede eliminar el rol porque está siendo usado')
      } else if (err.response?.status === 500) {
        const serverError = err.response?.data?.message || err.response?.data?.error || 'Error interno del servidor'
        throw new Error(`Error del servidor (500): ${serverError}. Posiblemente el rol tiene datos corruptos o hay un problema en la base de datos.`)
      } else if (err.message) {
        throw new Error(err.message)
      } else {
        throw new Error('Error desconocido al eliminar el rol')
      }
    }
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

// Custom hooks for permissions
export const useGetAllPermissions = () => {
  return useQuery<SimpleUserPermission[]>({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const response = await HttpClient.get(`${API_RESOURCE_PATH}/permissions`)

      // Handle different response structures
      let permissions = response.data

      // If the response is wrapped in a data property
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        permissions = response.data.data
      }
      // If the response has a different structure, try to extract the array
      else if (response.data && !Array.isArray(response.data)) {
        // Look for common array property names
        if (response.data.permissions && Array.isArray(response.data.permissions)) {
          permissions = response.data.permissions
        } else if (response.data.items && Array.isArray(response.data.items)) {
          permissions = response.data.items
        } else if (response.data.results && Array.isArray(response.data.results)) {
          permissions = response.data.results
        } else {
          return []
        }
      }

      return permissions || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateRolePermissions = () => {
  return useMutation({
    mutationFn: (payload: { roleId: string, permissions: any[] }) =>
      HttpClient.patch(`${API_RESOURCE_PATH}/${payload.roleId}/permissions`, { permissions: payload.permissions })
        .then(res => res.data)
  })
}

// Custom delete hook with better error handling
export const useDeleteUserRoleCustom = () => {
  return useMutation({
    mutationFn: (id: string) => {
      console.log('🔍 Delete mutation called with ID:', id)
      return userRoleService.deleteRole(id)
    },
    onSuccess: () => {
      console.log('✅ Role deletion successful')
      // Don't show toast here, let the calling component handle it
    },
    onError: (error: any) => {
      console.error('❌ Role deletion failed:', error)
      // Don't show toast here, let the calling component handle it
    }
  })
}

export default userRoleService