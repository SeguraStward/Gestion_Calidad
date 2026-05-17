import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import HttpClient from '@/lib/http-client'
import { useQuery } from '@tanstack/react-query'
import type {
  CreateDimensionDto,
  Dimension,
  UpdateDimensionDto
} from '../types/dimensions.types'

// Base service instance
export const dimensionService = new GenericService<
  Dimension,
  CreateDimensionDto,
  UpdateDimensionDto
>('dimensions')

// Extended functionality as separate functions
export const dimensionServiceExtended = {
  /**
   * Get dimensions with all nested relations for the evidence selector
   */
  async getWithFullHierarchy(): Promise<any[]> {
    try {
      const response = await HttpClient.get('/dimensions?include=components.criteria.standards.evidences')
      // Handle response format (could be paginated or direct array)
      const data = response.data
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [data.data]
      }
      return Array.isArray(data) ? data : [data]
    } catch (err) {
      console.error('Error fetching dimensions with full hierarchy:', err)
      // Return mock data for development
      return [
        {
          id: 1,
          name: "Dimensión 1",
          components: [
            {
              id: 1,
              name: "Componente 1.1",
              criteria: [
                {
                  id: 1,
                  name: "Criterio 1.1.1",
                  standards: [
                    {
                      id: 1,
                      name: "Estándar 1.1.1.A",
                      qualityEvidences: [
                        {
                          id: 1,
                          name: "Evidencia 1",
                          description: "Descripción de evidencia 1"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },

  /**
   * Get dimensions with only direct components
   */
  async getWithComponents(): Promise<any[]> {
    try {
      const response = await HttpClient.get('/dimensions?include=components')
      const data = response.data
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [data.data]
      }
      return Array.isArray(data) ? data : [data]
    } catch (err) {
      console.error('Error fetching dimensions with components:', err)
      throw err
    }
  },

  /**
   * Get next available order/code for a new dimension
   */
  async getNextOrder(): Promise<number> {
    try {
      const response = await HttpClient.get('/dimensions/next-order')
      return response.data.nextOrder || 1
    } catch (err) {
      console.error('Error fetching next dimension order:', err)
      // Return 1 as default if endpoint doesn't exist yet
      return 1
    }
  }
}

export const {
  useList: useDimensions,
  useOne: useDimension,
  useCreate: useCreateDimension,
  useUpdate: useUpdateDimension,
  useRemove: useDeleteDimension
} = createGenericHooks('dimensions', dimensionService, {
  messages: {
    created: () => 'Dimensión creada con éxito',
    updated: () => 'Dimensión actualizada con éxito',
    deleted: () => 'Dimensión eliminada con éxito'
  },
  // Delete errors (FK violations with child components) are handled via
  // AlertDialog in the structure tab — suppress the default toast.
  silent: { remove: { error: true } }
})

// Custom hooks for extended functionality
export const useDimensionsWithFullHierarchy = () => {
  return useQuery({
    queryKey: ['dimensions-with-full-hierarchy'],
    queryFn: () => dimensionServiceExtended.getWithFullHierarchy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

export const useDimensionsWithComponents = () => {
  return useQuery({
    queryKey: ['dimensions-with-components'],
    queryFn: () => dimensionServiceExtended.getWithComponents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

export const useNextDimensionOrder = () => {
  return useQuery({
    queryKey: ['dimensions-next-order'],
    queryFn: () => dimensionServiceExtended.getNextOrder(),
    staleTime: 0, // Always fresh
    retry: 1,
  })
}
