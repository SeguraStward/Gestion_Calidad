import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { GroupWithRelations } from '@/shared/types/group'

const groupService = new GenericService<GroupWithRelations, any, any>('academic-load-groups')

export function useAcademicGroup() {
  return useQuery({
    queryKey: ['academic-load-groups', { status: 'ACTIVE', limit: 1000 }],
    queryFn: async () => {
      const response = await groupService.list({ status: 'ACTIVE', limit: 1000 })
      return response.data
    },
    staleTime: 60_000,
    select: (data: GroupWithRelations[]) => {
      if (!Array.isArray(data)) return []
      return data.map(group => ({
        id: String(group.id),
        name: group.number,
        number: group.number
      }))
    }
  })
}
