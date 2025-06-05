import { createGenericHooks } from '../../../../../services/base/generic.hooks'
import { facultyService } from '../../services/institutional/faculty.service'
import { FacultyWithRelations, CreateFacultyInput } from '../../types/institutional/faculty'
import { GenericService } from '../../../../../services/base/generic.service' // Added for type safety
import { useQuery, UseQueryOptions } from '@tanstack/react-query' // Added for custom hook
import { PaginatedResponse } from '../../../../../services/interfaces' // Added for type safety

export interface FacultyFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const {
  useList: useListFacultiesPaginated, // Renamed to avoid conflict
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
  return useQuery<FacultyWithRelations[], Error, FacultyWithRelations[], (string | FacultyFilters | undefined)[]>({
    queryKey: ['faculties', filters],
    queryFn: async () => {
      const response = await facultyService.list(filters)
      // Assuming response might be PaginatedResponse<FacultyWithRelations> or FacultyWithRelations[]
      // Adjust based on actual structure of 'response' from facultyService.list
      const data = response as any // Use 'as any' for now, or define a more specific type for response

      if (Array.isArray(data)) {
        return data
      }
      // If the data is paginated, it might be in a property like 'items' or 'data'
      if (data && Array.isArray(data.items)) {
        return data.items
      }
      if (data && Array.isArray(data.data)) {
        return data.data
      }
      console.warn('❌ No se pudo extraer la lista de facultades:', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListFaculties: data no es un array', data)
        return []
      }
      return data.map((f) => ({ ...f, id: f.id || (f as any)._id, schools: f.schools || [] })) // Handle _id and ensure schools array
    },
    staleTime: 60_000, // Example: 1 minute
    ...options
  })
}

// Exportamos todos los hooks para mantener la consistencia
export {
  useOneFaculty,
  useCreateFaculty,
  useUpdateFaculty,
  useRemoveFaculty,
  useListFacultiesPaginated // Exporting the paginated version as well
}
