import { createGenericHooks } from '@/services/base/generic.hooks'
import { regionalCenterService } from '../services/regional-center.service'
import type {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput,
  RegionalCenterFilters
} from '../types/regional-center'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

const QUERY_KEY_PREFIX = 'regional-centers'

// Hooks genéricos para CRUD y paginado
export const {
  useList: useListRegionalCentersPaginated,
  useOne: useOneRegionalCenter,
  useCreate: useCreateRegionalCenter,
  useUpdate: useUpdateRegionalCenter,
  useRemove: useRemoveRegionalCenter
} = createGenericHooks<RegionalCenterWithRelations, CreateRegionalCenterInput, UpdateRegionalCenterInput, RegionalCenterFilters>(
  QUERY_KEY_PREFIX,
  regionalCenterService as GenericService<
    RegionalCenterWithRelations,
    CreateRegionalCenterInput,
    UpdateRegionalCenterInput,
    RegionalCenterFilters
  >,
  {
    messages: {
      created: () => 'Centro regional creado exitosamente',
      updated: () => 'Centro regional actualizado exitosamente',
      deleted: () => 'Centro regional eliminado exitosamente'
    }
  }
)

// Hook para obtener un array plano de centros regionales (para selects, etc)
export function useListRegionalCentersFlat(
  filters?: Omit<RegionalCenterFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<RegionalCenterWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  const effectiveFilters = { ...filters, limit: 1000 }
  return useQuery<RegionalCenterWithRelations[], Error, RegionalCenterWithRelations[]>({
    queryKey: [QUERY_KEY_PREFIX + '-flat', effectiveFilters],
    queryFn: async () => {
      const response = await regionalCenterService.list(effectiveFilters)
      const data = (response as any)?.data || response
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.items)) return data.items
      if (data && Array.isArray(data.data)) return data.data
      console.warn('❌ No se pudo extraer la lista de centros regionales (flat):', data)
      return []
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('useListRegionalCentersFlat: data no es un array', data)
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
