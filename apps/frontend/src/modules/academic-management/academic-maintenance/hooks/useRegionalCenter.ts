import { createGenericHooks } from '@/services/base/generic.hooks'
import { regionalCenterService } from '../services/regional-center.service'
import type {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput,
  RegionalCenterFilters
} from '../types/regional-center'
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
  // Asegura que page y limit sean planos y no objetos anidados
  const { page: _page, limit: _limit, ...rest } = filters || {}
  return useQuery<PaginatedResponse<RegionalCenterWithRelations>, Error>({
    queryKey: [QUERY_KEY_PREFIX, 'paginated', page, limit, rest],
    queryFn: () => regionalCenterService.list({ ...rest, page, limit }),
    ...options
  })
}

// Hook para listar centros regionales por campus
// (No se usa en el CRUD actual, pero se deja por si se requiere en otros módulos)
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
  options?: Omit<
    UseQueryOptions<Pick<RegionalCenterWithRelations, 'id' | 'code' | 'name' | 'status'>[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  // Si no se especifica limit, usar un valor alto para selects
  const effectiveFilters = { ...filters, limit: filters?.limit ?? 1000 }
  return useQuery({
    queryKey: [QUERY_KEY_PREFIX, effectiveFilters],
    queryFn: async () => {
      const response = await regionalCenterService.list(effectiveFilters)
      return response.data.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        status: item.status
      }))
    },
    ...options
  })
}

// Hooks genéricos para CRUD
export const {
  useOne: useOneRegionalCenter,
  useCreate: useCreateRegionalCenter,
  useUpdate: useUpdateRegionalCenter,
  useRemove: useRemoveRegionalCenter
} = createGenericHooks<RegionalCenterWithRelations, CreateRegionalCenterInput, UpdateRegionalCenterInput>(
  QUERY_KEY_PREFIX,
  regionalCenterService
)
