import { createGenericHooks } from '../../../../../services/base/generic.hooks'
import { regionalCenterService } from '@/modules/academic-management/academic-maintenance/services/institutional/regional-center.service'
import {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput
} from '@/modules/academic-management/academic-maintenance/types/institutional/regional-center'
import { GenericService } from '../../../../../services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface RegionalCenterFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const {
  useList: useListRegionalCentersPaginated,
  useOne: useOneRegionalCenter,
  useCreate: useCreateRegionalCenter,
  useUpdate: useUpdateRegionalCenter,
  useRemove: useRemoveRegionalCenter
} = createGenericHooks<
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  Partial<CreateRegionalCenterInput>,
  RegionalCenterFilters
>(
  'regional-centers',
  regionalCenterService as GenericService<
    RegionalCenterWithRelations,
    CreateRegionalCenterInput,
    Partial<CreateRegionalCenterInput>,
    RegionalCenterFilters
  >,
  {
    messages: {
      created: () => 'Sede Regional creada exitosamente',
      updated: () => 'Sede Regional actualizada exitosamente',
      deleted: () => 'Sede Regional eliminada exitosamente'
    }
  }
)

// Hook personalizado que siempre devuelve un array plano de sedes regionales
export function useListRegionalCenters(
  filters?: RegionalCenterFilters,
  options?: Omit<UseQueryOptions<RegionalCenterWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['regional-centers', filters],
    queryFn: async () => {
      const response = await regionalCenterService.list(filters)
      console.log('📦 Respuesta cruda:', response)

      if (!response || !response.data) {
        console.warn('❌ Respuesta o datos de respuesta no válidos:', response)
        return []
      }

      const responseData = response.data as any // Usar 'any' con precaución y conocimiento de la estructura

      // Caso 1: La respuesta paginada tiene 'data.items'
      if (responseData && responseData.items && Array.isArray(responseData.items)) {
        return responseData.items as RegionalCenterWithRelations[]
      }

      // Caso 2: La respuesta es directamente un array (para APIs no paginadas o diferentes estructuras)
      if (Array.isArray(responseData)) {
        return responseData as RegionalCenterWithRelations[]
      }

      // Caso 3: La respuesta paginada tiene 'data.data' (otra estructura común)
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data as RegionalCenterWithRelations[]
      }

      console.warn('❌ No se pudo extraer la lista de sedes regionales de la estructura de datos:', responseData)
      return []
    },
    select: (data) => {
      // Si por alguna razón data no fuera un array, devolvemos un array vacío
      if (!Array.isArray(data)) {
        console.warn('useListRegionalCenters: data no es un array', data)
        return []
      }
      return data
    },
    staleTime: 60_000,
    ...options
  })
}

// Exportamos todos los hooks para mantener la consistencia
export {
  useOneRegionalCenter,
  useCreateRegionalCenter,
  useUpdateRegionalCenter,
  useRemoveRegionalCenter,
  // También exportamos el hook paginado original por si se necesita
  useListRegionalCentersPaginated
}
