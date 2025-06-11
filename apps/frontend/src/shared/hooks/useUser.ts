import { useQuery } from '@tanstack/react-query'
import { createGenericHooks } from '@/services/base/generic.hooks'
import { userService } from '@/modules/user-management/user-maintenance/services/user.service'
import type { UserWithRelations, CreateUserInput, UpdateUserInput } from '@/shared/types/user'

// Hooks CRUD para usuarios, usando el servicio y tipado refinado
export const {
  useList: usePaginatedUsers,
  useOne: useUser,
  useCreate: useCreateUser,
  useUpdate: useUpdateUser,
  useRemove: useDeleteUser
} = createGenericHooks<UserWithRelations, CreateUserInput, UpdateUserInput>('users', userService, {
  messages: {
    created: (u) => `Usuario creado: ${(u as any).email || ''}`,
    updated: (u) => `Usuario actualizado: ${(u as any).email || ''}`,
    deleted: () => 'Usuario eliminado'
  }
})

export function useActiveUsers() {
  return useQuery({
    queryKey: ['users', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => userService.list({ status: 'ACTIVE', limit: 1000 }).then((res) => res.data),
    staleTime: 60_000,
    select: (data) =>
      data.map((user) => ({
        id: user.id,
        name: `${user.fullName} ${user.fullLastName || ''}`.trim(),
        email: user.email
      }))
  })
}

export function useUsersByRole(roleName: string, userStatus: string = 'ACTIVE', page = 1, limit = 1000) {
  return useQuery({
    queryKey: ['users', { roleName, userStatus, page, limit }],
    queryFn: async () => {
      const response = await userService.listByRole(roleName, userStatus, page, limit)
      // El backend retorna { data, meta }, así que devolvemos solo data
      return response.data
    },
    staleTime: 60_000,
    select: (data: any[]) =>
      data.map((user: any) => ({
        id: user.id,
        name: `${user.fullName} ${user.fullLastName || ''}`.trim(),
        email: user.email
      }))
  })
}
