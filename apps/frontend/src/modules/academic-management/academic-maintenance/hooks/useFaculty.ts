import { createGenericHooks } from '@/services/base/generic.hooks'
import { facultyService } from '../services/faculty.service'
import { FacultyWithRelations, CreateFacultyInput } from '../types/faculty'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface FacultyFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Hooks CRUD y paginado
const {
  useOne: useOneFaculty,
  useCreate: useCreateFaculty,
  useUpdate: useUpdateFaculty,
  useRemove: useRemoveFaculty,
  useList: useListFacultiesPaginated
} = createGenericHooks<FacultyWithRelations, CreateFacultyInput, Partial<CreateFacultyInput>, FacultyFilters>(
  'faculties',
  facultyService as GenericService<FacultyWithRelations, CreateFacultyInput, Partial<CreateFacultyInput>, FacultyFilters>,
  {
    messages: {
      created: () => 'Facultad creada exitosamente',
      updated: () => 'Facultad actualizada exitosamente',
      deleted: () => 'Facultad eliminada exitosamente'
    }
  }
)

// Hook para obtener un array plano de facultades (para selects, etc)
export function useListFacultiesFlat(
  filters?: Omit<FacultyFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<FacultyWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FacultyWithRelations[], Error, FacultyWithRelations[]>({
    queryKey: ['faculties-flat', filters],
    queryFn: async () => {
      const response = await facultyService.list({ ...filters, limit: 1000 })
      const data = (response as any)?.data || response
      if (Array.isArray(data)) return data.map((f: any) => ({ ...f, schools: f.schools || [] }))
      if (data && Array.isArray(data.items)) return data.items
      if (data && Array.isArray(data.data)) return data.data
      console.warn('❌ No se pudo extraer la lista de facultades (flat):', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListFacultiesFlat: data no es un array', data)
        return []
      }
      return data.map((f) => ({ ...f, id: f.id || (f as any)._id, schools: f.schools || [] }))
    },
    staleTime: 60_000,
    ...options
  })
}

export { useOneFaculty, useCreateFaculty, useUpdateFaculty, useRemoveFaculty, useListFacultiesPaginated }
