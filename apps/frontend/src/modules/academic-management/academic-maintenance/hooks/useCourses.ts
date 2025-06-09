import { createGenericHooks } from '@/services/base/generic.hooks'
import { courseService } from '../services/course.service'
import { CourseWithRelations, CreateCourseInput } from '@/shared/types/course'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface CourseFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  careerId?: string
}

export const {
  useList: useListCoursesPaginated,
  useOne: useOneCourse,
  useCreate: useCreateCourse,
  useUpdate: useUpdateCourse,
  useRemove: useRemoveCourse
} = createGenericHooks<CourseWithRelations, CreateCourseInput, Partial<CreateCourseInput>, CourseFilters>(
  'courses',
  courseService as GenericService<CourseWithRelations, CreateCourseInput, Partial<CreateCourseInput>, CourseFilters>,
  {
    messages: {
      created: () => 'Curso creado exitosamente',
      updated: () => 'Curso actualizado exitosamente',
      deleted: () => 'Curso eliminado exitosamente'
    }
  }
)

// Hook para obtener un array plano de cursos (para selects, etc)
export function useListCoursesFlat(
  filters?: Omit<CourseFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<CourseWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CourseWithRelations[], Error, CourseWithRelations[]>({
    queryKey: ['courses-flat', filters],
    queryFn: async () => {
      const response = await courseService.list({ ...filters, limit: 1000 })
      const data = (response as any)?.data || response
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.items)) return data.items
      if (data && Array.isArray(data.data)) return data.data
      console.warn('❌ No se pudo extraer la lista de cursos (flat):', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListCoursesFlat: data no es un array', data)
        return []
      }
      return data.map((item) => ({
        ...item,
        id: item.id || (item as any)._id
      }))
    },
    staleTime: 60_000,
    ...options
  })
}
