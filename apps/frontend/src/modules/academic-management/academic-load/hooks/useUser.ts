import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { UserWithRelations } from '../../../../shared/types/user'

const userService = new GenericService<UserWithRelations, any, any, any>('users')

export function useUser() {
  return useQuery({
    queryKey: ['users', { status: 'ACTIVE', role: 'PROFESOR' }],
    queryFn: async () => {
      const res = await userService.list({ status: 'ACTIVE', role: 'PROFESOR' })
      return res.data
    },
    staleTime: 60_000,
    select: (data) =>
      data?.map(user => ({
        id: user.id,
        name: `${user.fullName} ${user.fullLastName || ''}`.trim(),
        email: user.email
      })) ?? []
  })
} 