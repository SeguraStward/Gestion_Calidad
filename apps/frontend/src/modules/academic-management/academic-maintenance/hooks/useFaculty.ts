import { createGenericHooks } from '@/services/base/generic.hooks'
import { facultyService } from '../services/faculty.service'
import { FacultyWithRelations, CreateFacultyInput } from '../types/faculty'
import { GenericService } from '@/services/base/generic.service' // Added for type safety
import { useQuery, UseQueryOptions } from '@tanstack/react-query' // Added for custom hook
import { PaginatedResponse } from '@/services/interfaces' // Added for type safety

export interface FacultyFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const {
  useOne: useOneFaculty,
  useCreate: useCreateFaculty,
  useUpdate: useUpdateFaculty,
  useRemove: useRemoveFaculty
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

// Hook personalizado que siempre devuelve un array plano de facultades
export function useListFaculties(
  filters?: FacultyFilters,
  options?: Omit<UseQueryOptions<FacultyWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  // Si no se especifica limit, usar un valor alto para selects
  const effectiveFilters = { ...filters, limit: filters?.limit ?? 1000 }
  return useQuery<FacultyWithRelations[], Error, FacultyWithRelations[]>({
    queryKey: ['faculties', effectiveFilters],
    queryFn: async () => {
      const response = await facultyService.list(effectiveFilters)
      // El backend devuelve { data, meta }
      const data = (response as any)?.data || response
      if (Array.isArray(data)) {
        return data.map((f: any) => ({ ...f, schools: f.schools || [] }))
      }
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListFaculties: data no es un array', data)
        return []
      }
      return data.map((f) => ({ ...f, id: f.id || (f as any)._id, schools: f.schools || [] }))
    },
    staleTime: 60_000, // Example: 1 minute
    ...options
  })
}

// Hook paginado explícito para el CRUD (igual que regional centers)
export function useListFacultiesPaginated(
  filters?: FacultyFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<FacultyWithRelations>, Error>, 'queryKey' | 'queryFn'>
) {
  const { page = 1, limit = 10, ...rest } = filters || {}
  return useQuery<PaginatedResponse<FacultyWithRelations>, Error>({
    queryKey: ['faculties', 'paginated', page, limit, rest],
    queryFn: () => facultyService.list({ ...rest, page, limit }),
    ...options
  })
}

// Exportamos todos los hooks para mantener la consistencia
export { useOneFaculty, useCreateFaculty, useUpdateFaculty, useRemoveFaculty }
