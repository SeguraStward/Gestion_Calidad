import { createGenericHooks } from '@/services/base/generic.hooks'
import { userService } from '../services/user.service'
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
