import { createGenericHooks } from '@/services/base/generic.hooks'
import { careerService } from '../services/career.service'
import { CareerWithRelations, CreateCareerInput } from '../types/career'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface CareerFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  schoolId?: string // Filtro por escuela
}

const {
  useList: useListCareersPaginated, // paginado para tablas
  useOne: useOneCareer,
  useCreate: useCreateCareer,
  useUpdate: useUpdateCareer,
  useRemove: useRemoveCareer
} = createGenericHooks<CareerWithRelations, CreateCareerInput, Partial<CreateCareerInput>, CareerFilters>(
  'careers',
  careerService as GenericService<CareerWithRelations, CreateCareerInput, Partial<CreateCareerInput>, CareerFilters>,
  {
    messages: {
      created: () => 'Carrera creada exitosamente',
      updated: () => 'Carrera actualizada exitosamente',
      deleted: () => 'Carrera eliminada exitosamente'
    }
  }
)

// Hook personalizado que siempre devuelve un array plano de carreras
export function useListCareersFlat(
  filters?: Omit<CareerFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<CareerWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CareerWithRelations[], Error, CareerWithRelations[]>({
    queryKey: ['careers-flat', filters],
    queryFn: async () => {
      const response = await careerService.list({ ...filters, limit: 1000 })
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
      console.warn('❌ No se pudo extraer la lista de carreras (flat):', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListCareers (flat): data no es un array', data)
        return []
      }
      return data.map((career) => ({
        ...career,
        id: career.id || (career as any)._id,
        school: career.school || null,
        courses: career.courses || [],
        projects: career.projects || []
      }))
    },
    staleTime: 60_000,
    ...options
  })
}

export { useOneCareer, useCreateCareer, useUpdateCareer, useRemoveCareer, useListCareersPaginated }
