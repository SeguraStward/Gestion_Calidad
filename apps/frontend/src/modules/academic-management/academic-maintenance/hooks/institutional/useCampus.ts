import { createGenericHooks } from '../../../../../services/base/generic.hooks'
import { campusService } from '../../services/institutional/campus.service'
import { CampusWithRelations, CreateCampusInput } from '../../types/institutional/campus'
import { GenericService } from '../../../../../services/base/generic.service' // Added for type safety
import { useQuery, UseQueryOptions } from '@tanstack/react-query' // Added for custom hook
import { PaginatedResponse } from '../../../../../services/interfaces' // Added for type safety

export interface CampusFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  regionalCenterId?: string // Filtro por sede regional
}

const {
  useList: useListCampusesPaginated, // Renamed to avoid conflict
  useOne: useOneCampus,
  useCreate: useCreateCampus,
  useUpdate: useUpdateCampus,
  useRemove: useRemoveCampus
} = createGenericHooks<CampusWithRelations, CreateCampusInput, Partial<CreateCampusInput>, CampusFilters>(
  'campuses',
  campusService as GenericService<CampusWithRelations, CreateCampusInput, Partial<CreateCampusInput>, CampusFilters>,
  {
    messages: {
      created: () => 'Campus creado exitosamente',
      updated: () => 'Campus actualizado exitosamente',
      deleted: () => 'Campus eliminado exitosamente'
    }
  }
)

// Hook personalizado que siempre devuelve un array plano de campus
export function useListCampuses(
  filters?: Omit<CampusFilters, 'page' | 'limit'>, // Allow all filters except pagination for a flat list
  options?: Omit<UseQueryOptions<CampusWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CampusWithRelations[], Error, CampusWithRelations[]>({
    queryKey: ['campuses-flat', filters], // Unique query key for the flat list
    queryFn: async () => {
      // Fetch all items, so no pagination params or a very high limit
      const response = await campusService.list({ ...filters, limit: 1000 }) // Adjust limit as needed or if service supports no pagination
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
      console.warn('❌ No se pudo extraer la lista de campus (flat):', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListCampuses (flat): data no es un array', data)
        return []
      }
      return data.map((campus) => ({
        ...campus,
        id: campus.id || (campus as any)._id, // Handle _id
        regionalCenter: campus.regionalCenter || null, // Ensure regionalCenter object or null
        classrooms: campus.classrooms || [], // Ensure classrooms array
        academicLoads: campus.academicLoads || [] // Ensure academicLoads array
      }))
    },
    staleTime: 60_000, // Example: 1 minute
    ...options
  })
}

// Exportamos todos los hooks para mantener la consistencia
export {
  useOneCampus,
  useCreateCampus,
  useUpdateCampus,
  useRemoveCampus,
  useListCampusesPaginated // Exporting the paginated version as well
}
