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

export function useGetUserRoles(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'roles'],
    queryFn: () => userService.getUserRoles(userId),
    enabled: !!userId
  })
}

export default userService