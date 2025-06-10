import { createGenericHooks } from '@/services/base/generic.hooks'
import { schoolService } from '../services/school.service'
import { SchoolWithRelations, CreateSchoolInput } from '../types/school'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
//FIXED

export interface SchoolFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const {
  useList: useListSchoolsPaginated,
  useOne: useOneSchool,
  useCreate: useCreateSchool,
  useUpdate: useUpdateSchool,
  useRemove: useRemoveSchool
} = createGenericHooks<SchoolWithRelations, CreateSchoolInput, Partial<CreateSchoolInput>, SchoolFilters>(
  'schools',
  schoolService as GenericService<SchoolWithRelations, CreateSchoolInput, Partial<CreateSchoolInput>, SchoolFilters>,
  {
    messages: {
      created: () => 'Escuela creada exitosamente',
      updated: () => 'Escuela actualizada exitosamente',
      deleted: () => 'Escuela eliminada exitosamente'
    }
  }
)

// Hook personalizado que siempre devuelve un array plano de escuelas
export function useListSchoolsFlat(
  filters?: Omit<SchoolFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<SchoolWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SchoolWithRelations[], Error, SchoolWithRelations[]>({
    queryKey: ['schools-flat', filters],
    queryFn: async () => {
      const response = await schoolService.list({ ...filters, limit: 1000 })
      const data = response as any
      if (Array.isArray(data)) {
        return data
      }
      if (data && Array.isArray(data.items)) {
        return data.items
      }
      if (data && Array.isArray(data.data)) {
        return data.data
      }
      console.warn('❌ No se pudo extraer la lista de escuelas (flat):', data)
      return []
    },
    select: (data: any) => {
      if (!Array.isArray(data)) {
        console.warn('useListSchoolsFlat: data no es un array', data)
        return []
      }
      return data.map((school: any) => ({
        ...school,
        id: school.id || (school as any)._id,
        faculty: school.faculty || null,
        careers: school.careers || []
      }))
    },
    staleTime: 60_000,
    ...options
  })
}
