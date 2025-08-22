// Crear: /modules/user-management/user/service/user.service.ts
import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  User,
  UserFilters,
  CreateUserDto,
  UpdateUserDto
} from '../types/user.types'
import type { PaginatedResponse } from '@/services/interfaces'

const API_RESOURCE_PATH = 'users'

class UserService extends GenericService<
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters
> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  // Método para actualizar estado
  async updateStatus(userId: string, status: string) {
    return HttpClient.patch(`${this.resource}/${userId}/status`, { status }).then(res => res.data)
  }

  // Método para actualizar roles
  async updateRoles(userId: string, roleIds: string[]) {
    return HttpClient.patch(`${this.resource}/${userId}/roles`, { roleIds }).then(res => res.data)
  }

  // Método para actualizar perfil básico usando endpoint específico
  async updateProfile(userId: string, updateData: Partial<UpdateUserDto>) {
    console.log('🔍 [UserService] updateProfile called with:', { userId, updateData })
    console.log('🔍 [UserService] JSON payload:', JSON.stringify(updateData, null, 2))
    return HttpClient.patch(`${this.resource}/${userId}/profile`, updateData).then(res => res.data)
  }

  // Método para obtener roles de un usuario
  async getUserRoles(userId: string) {
    console.log('🔍 [DEBUG] Calling getUserRoles for user:', userId);
    console.log('🔍 [DEBUG] About to make HTTP request to:', `${this.resource}/${userId}/roles-debug`);

    try {
      const response = await HttpClient.get(`${this.resource}/${userId}/roles-debug`);
      console.log('🔍 [DEBUG] Response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ [DEBUG] Error in getUserRoles:', err);
      console.error('❌ [DEBUG] Error response:', err?.response);
      throw err;
    }
  }
}

export const userService = new UserService()

export const {
  useList: useUsers,
  useOne: useUser,
  useCreate: useCreateUser,
  useUpdate: useUpdateUser,
  useRemove: useDeleteUser
} = createGenericHooks<
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters
>(
  'users',
  userService,
  {
    messages: {
      created: (user) => `Usuario "${user.fullName}" creado exitosamente.`,
      updated: (user) => `Usuario "${user.fullName}" actualizado correctamente.`,
      deleted: () => 'Usuario eliminado correctamente.'
    }
  }
)

export function useGetPaginatedUsers(filters: UserFilters) {
  return useUsers(filters)
}

export function useGetUserById(id: string) {
  return useUser(id)
}

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: (payload: { userId: string, status: string }) =>
      userService.updateStatus(payload.userId, payload.status)
  })
}

export function useUpdateUserRoles() {
  return useMutation({
    mutationFn: (payload: { userId: string, roleIds: string[] }) =>
      userService.updateRoles(payload.userId, payload.roleIds)
  })
}

// Hook específico para actualizar perfil usando endpoint PATCH
export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: (payload: { userId: string, updateData: Partial<UpdateUserDto> }) =>
      userService.updateProfile(payload.userId, payload.updateData),
    onSuccess: () => {
      // Invalidar queries relacionadas con usuarios
    },
    onError: (error: any) => {
      console.error('❌ Error en profile update mutation:', error)
    }
  })
}

export function useGetUserRoles(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'roles'],
    queryFn: () => userService.getUserRoles(userId),
    enabled: !!userId
  })
}

// Custom hook for user deletion with better error handling
export function useDeleteUserWithCascade() {
  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        return await userService.remove(userId)
      } catch (error: any) {
        // Provide more descriptive error messages
        if (error?.response?.status === 400 && error?.response?.data?.message?.includes('associated records')) {
          throw new Error('No se puede eliminar el usuario porque tiene registros asociados (roles, cargas académicas, etc.)')
        }
        throw error
      }
    },
    onSuccess: () => {
      // You can add additional success handling here
    },
    onError: (error: any) => {
      console.error('❌ Error en delete mutation:', error)
    }
  })
}

export default userService