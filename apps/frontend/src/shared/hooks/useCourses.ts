import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { CourseWithRelations } from '@/shared/types/course'

const courseService = new GenericService<CourseWithRelations, any, any>('courses')

export function useCourses() {
  return useQuery({
    queryKey: ['courses', { status: 'ACTIVE' }],
    queryFn: () => courseService.list({ status: 'ACTIVE' }).then(res => res.data),
    staleTime: 60_000,
    select: (data: CourseWithRelations[]) =>
      data.map((course) => ({
        id: course.id,
        name: course.name,
        code: course.code,
        credits: course.credits,
        status: course.status,
        // Puedes agregar más campos si los necesitas
      }))
  })
} 