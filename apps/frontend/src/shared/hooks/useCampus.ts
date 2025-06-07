import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { Campus, Status } from '@una-gc/database/prisma/generated/client'

interface CampusWithRelations extends Campus {
  name: string
  code: string
  status: Status
}

const campusService = new GenericService<CampusWithRelations, any, any, any>('campuses')

export function useCampus() {
  return useQuery({
    queryKey: ['campuses', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => campusService.list({ status: 'ACTIVE', limit: 1000 }).then(res => res.data),
    staleTime: 60_000,
    select: (data) => data.map(campus => ({
      id: campus.id,
      name: campus.name,
      code: campus.code
    }))
  })
}
