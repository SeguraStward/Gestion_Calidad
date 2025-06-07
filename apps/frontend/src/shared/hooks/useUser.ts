import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { User, UserStatus } from '@una-gc/database/prisma/generated/client'

interface UserWithRelations extends User {
  fullName: string
  fullLastName: string
  email: string
  status: UserStatus
}

const userService = new GenericService<UserWithRelations, any, any, any>('users')

export function useUser() {
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
