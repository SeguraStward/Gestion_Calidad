import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import { AcademicCycleWithRelations } from '@/shared/types/academic-cycle'

const academicCycleService = new GenericService<AcademicCycleWithRelations, any, any, any>('academic-cycles')

export function useAcademicCycle() {
  return useQuery({
    queryKey: ['academic-cycles', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => academicCycleService.list({ status: 'ACTIVE', limit: 1000 }).then((res) => res.data),
    staleTime: 60_000,
    select: (data) =>
      data.map((cycle) => ({
        id: cycle.id,
        name: cycle.name,
        code: cycle.code,
        year: cycle.year
      }))
  })
}
