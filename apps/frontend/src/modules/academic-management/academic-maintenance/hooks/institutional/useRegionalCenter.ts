import { createGenericHooks } from '@/services/base/generic.hooks'
import { regionalCenterService } from '../../services/institutional/regional-center.service'
import type { 
  RegionalCenterWithRelations, 
  CreateRegionalCenterInput, 
  UpdateRegionalCenterInput,
  RegionalCenterFilters
} from '../../types/institutional/regional-center'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/services/interfaces'

const QUERY_KEY_PREFIX = 'regional-centers'

// Hook para listar centros regionales paginados
export function useListRegionalCentersPaginated(
  page = 1,
  limit = 10,
  filters?: any,
  options?: Omit<UseQueryOptions<PaginatedResponse<RegionalCenterWithRelations>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<RegionalCenterWithRelations>, Error>({
    queryKey: [QUERY_KEY_PREFIX, 'paginated', page, limit, filters],
    queryFn: () => regionalCenterService.list({ page, limit, ...filters }),
    ...options
  })
}

// Hook para listar centros regionales por campus
export function useListRegionalCentersByCampus(
  campusId: string | null | undefined,
  filters?: any,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [QUERY_KEY_PREFIX, 'by-campus', campusId, filters],
    queryFn: () => regionalCenterService.listByCampusId(campusId!, filters),
    enabled: options?.enabled !== undefined ? options.enabled : !!campusId,
    ...options
  })
}

// Hook para listar centros regionales con campos específicos
export function useListRegionalCenters(
  filters?: RegionalCenterFilters,
  options?: Omit<UseQueryOptions<Pick<RegionalCenterWithRelations, 'id' | 'code' | 'name' | 'status'>[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [QUERY_KEY_PREFIX, filters],
    queryFn: async () => {
      const response = await regionalCenterService.list(filters);
      return response.data.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        status: item.status
      }));
    },
    ...options
  })
}

// Hooks genéricos para CRUD
export const {
  useOne: useOneRegionalCenter,
  useCreate: useCreateRegionalCenter,
  useUpdate: useUpdateRegionalCenter,
  useRemove: useRemoveRegionalCenter,
} = createGenericHooks<
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput
>(
  QUERY_KEY_PREFIX,
  regionalCenterService,
  {
    messages: {
      created: (data) => `Centro Regional "${data.name}" creado exitosamente`,
      updated: (data) => `Centro Regional "${data.name}" actualizado exitosamente`,
      deleted: () => 'Centro Regional eliminado exitosamente',
    },
  }
)