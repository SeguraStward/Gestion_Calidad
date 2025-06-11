import { createGenericHooks } from '@/services/base/generic.hooks'
import { userRoleService } from '../services/user-role.service'
import type { UserRole, CreateUserRoleInput, UpdateUserRoleInput } from '../services/user-role.service'
import { useQuery } from '@tanstack/react-query'

// Hooks CRUD para roles de usuario
export const {
  useList: usePaginatedUserRoles,
  useOne: useUserRole,
  useCreate: useCreateUserRole,
  useUpdate: useUpdateUserRole,
  useRemove: useDeleteUserRole
} = createGenericHooks<UserRole, CreateUserRoleInput, UpdateUserRoleInput>('user-roles', userRoleService, {
  messages: {
    created: (role) => `Rol creado: ${role.name}`,
    updated: (role) => `Rol actualizado: ${role.name}`,
    deleted: () => 'Rol eliminado'
  }
})

// Hook personalizado para obtener todos los roles activos (para selects)
export function useActiveUserRoles() {
  return usePaginatedUserRoles({
    status: 'ACTIVE',
    limit: 100 // Obtener todos los roles activos
  })
}

// Hook personalizado para obtener roles planos (para selects)
export function useActiveUserRolesFlat() {
  return useQuery<UserRole[], Error, UserRole[]>({
    queryKey: ['user-roles-flat', { status: 'ACTIVE' }],
    queryFn: async () => {
      try {
        const response = await userRoleService.list({ status: 'ACTIVE', limit: 1000 })
        console.log('🔍 Raw response from userRoleService.list:', response)

        const data = response as any

        // Verificar si es una respuesta paginada {data: [...], meta: {...}}
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          console.log('✅ Found paginated data.data array:', data.data.length, 'roles')
          return data.data
        }

        // Verificar si es un array directo
        if (Array.isArray(data)) {
          console.log('✅ Found direct array:', data.length, 'roles')
          return data
        }

        // Verificar si tiene la propiedad items
        if (data && Array.isArray(data.items)) {
          console.log('✅ Found data.items array:', data.items.length, 'roles')
          return data.items
        }

        console.warn('❌ No se pudo extraer la lista de roles (flat):', data)
        return []
      } catch (error) {
        console.error('❌ Error fetching roles:', error)
        // Si es un error de autenticación, devolver datos mock para desarrollo
        if ((error as any)?.statusCode === 401 || (error as any)?.response?.status === 401) {
          console.warn('⚠️ Authentication error when fetching roles, returning mock data for development')
          // Datos mock para desarrollo
          return [
            { id: 'admin', name: 'Administrador', description: 'Rol de administrador', status: 'ACTIVE' },
            { id: 'professor', name: 'Profesor', description: 'Rol de profesor', status: 'ACTIVE' },
            { id: 'coordinator', name: 'Coordinador', description: 'Rol de coordinador', status: 'ACTIVE' },
            { id: 'reviewer', name: 'Revisor', description: 'Rol de revisor', status: 'ACTIVE' }
          ]
        }
        throw error
      }
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useActiveUserRolesFlat: data no es un array', data)
        return []
      }
      const mappedRoles = data.map((role: any) => ({
        ...role,
        id: role.id || (role as any)._id
      }))
      console.log('🔍 Mapped roles for select:', mappedRoles)
      return mappedRoles
    },
    staleTime: 60_000,
    retry: (failureCount, error) => {
      // No reintentar errores de autenticación
      if ((error as any)?.statusCode === 401 || (error as any)?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook personalizado para obtener los roles del usuario actual autenticado
export function useCurrentUserRoles() {
  return useQuery({
    queryKey: ['current-user-roles'],
    queryFn: async () => {
      const response = await fetch('/api/v1/users/me/roles/active', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener los roles del usuario')
      }

      return response.json()
    },
    staleTime: 60_000
  })
}
