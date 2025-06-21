import { UseQueryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { GenericService } from './generic.service'
import type { PaginatedResponse } from '../interfaces'

// Helper function to extract a meaningful error message
const getApiErrorMessage = (error: any): string => {
  if (error && error.response && error.response.data) {
    const data = error.response.data
    if (typeof data.message === 'string' && data.message.trim() !== '') {
      return data.message
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      const filteredMessages = data.message.filter((m: any) => typeof m === 'string' && m.trim() !== '')
      if (filteredMessages.length > 0) return filteredMessages.join(', ')
    }
    if (typeof data.error === 'string' && data.error.trim() !== '') {
      return data.error
    }
    // Handle Laravel-style validation errors or other object-based errors
    if (data.errors && typeof data.errors === 'object') {
      const messages: string[] = []
      if (Array.isArray(data.errors)) {
        // Array of error strings or objects
        data.errors.forEach((err: any) => {
          if (typeof err === 'string') messages.push(err)
          else if (err && typeof err.message === 'string') messages.push(err.message)
        })
      } else {
        // Object with field names as keys and error arrays/strings as values
        Object.values(data.errors).forEach((fieldErrors: any) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg) => {
              if (typeof msg === 'string') messages.push(msg)
            })
          } else if (typeof fieldErrors === 'string') {
            messages.push(fieldErrors)
          }
        })
      }
      if (messages.length > 0) return messages.filter((m) => m.trim() !== '').join(', ')
    }
    if (typeof data === 'string' && data.trim() !== '') {
      // Sometimes the error is just a string in data
      return data
    }
  }
  if (error && typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message
  }
  // Check for GraphQL-like errors
  if (error && Array.isArray(error.errors) && error.errors.length > 0) {
    const gqlMessages = error.errors.map((e: any) => e.message).filter((m: any) => typeof m === 'string' && m.trim() !== '')
    if (gqlMessages.length > 0) return gqlMessages.join(', ')
  }

  return 'Se produjo un error inesperado. Por favor, inténtelo de nuevo.' // User-facing: Spanish
}

export function createGenericHooks<T, CreateDTO, UpdateDTO = Partial<T>, Filters = unknown>(
  queryKeyPrefix: string,
  service: GenericService<T, CreateDTO, UpdateDTO, Filters>,
  opts?: {
    messages?: {
      created?: (e: T) => string
      updated?: (e: T) => string
      deleted?: () => string
    }
  }
) {
  /* ─────────────── Collection ─────────────── */
  function useList(filters?: Filters, options?: Omit<UseQueryOptions<PaginatedResponse<T>, Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: [queryKeyPrefix, filters],
      queryFn: () => service.list(filters),
      staleTime: 60_000,
      ...options
    })
  }

  /* ─────────────── Single item ─────────────── */
  function useOne(id: string, filters?: Filters, options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: [queryKeyPrefix, id, filters],
      queryFn: () => service.get(id, filters as Filters),
      // 2. Usar el 'enabled' de las opciones si existe, sino usar '!!id' como fallback
      enabled: options?.enabled !== undefined ? options.enabled : !!id,
      staleTime: 60_000,
      ...options
    })
  }

  /* ─────────────── Mutations ─────────────── */
  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (payload: CreateDTO) => service.create(payload),
      onSuccess: (data) => {
        console.log('✅ Creación exitosa, invalidando queries...', data)

        // Invalidar TODAS las queries relacionadas
        qc.invalidateQueries({
          queryKey: [queryKeyPrefix],
          exact: false // Esto invalida todas las queries que empiecen con queryKeyPrefix
        })

        // Si el objeto creado tiene userId, invalidar específicamente esas queries
        if ((data as any).userId) {
          const userId = (data as any).userId
          console.log('🔄 Invalidando queries específicas para userId:', userId)

          qc.invalidateQueries({
            queryKey: [queryKeyPrefix, { userId }],
            exact: false
          })

          // Forzar refetch inmediato de la query específica
          qc.refetchQueries({
            queryKey: [queryKeyPrefix, { userId }],
            exact: false
          })
        }

        // Invalidar todas las variantes posibles
        qc.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey
            return Array.isArray(key) && key[0] === queryKeyPrefix
          }
        })

        toast.success(opts?.messages?.created?.(data) ?? 'Creado exitosamente') // User-facing: Spanish
      },
      onError: (error: any) => {
        const errorMessage = getApiErrorMessage(error)
        console.error('❌ Error en create mutation:', error.response?.data || error.message || error)
        toast.error(`Error al crear: ${errorMessage}`) // User-facing: Spanish
      }
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (payload: { id: string; data: UpdateDTO }) => service.update(payload.id, payload.data),
      onSuccess: (data: T) => {
        console.log('✅ Actualización exitosa, invalidando queries...', data)

        // Invalidar todas las queries relacionadas
        qc.invalidateQueries({
          queryKey: [queryKeyPrefix],
          exact: false
        })

        // Invalidar query específica del item
        qc.invalidateQueries({
          queryKey: [queryKeyPrefix, (data as any).id],
          exact: false
        })

        // Si tiene userId, invalidar también esas queries
        if ((data as any).userId) {
          qc.invalidateQueries({
            queryKey: [queryKeyPrefix, { userId: (data as any).userId }],
            exact: false
          })
        }

        toast.success(opts?.messages?.updated?.(data) ?? 'Actualizado correctamente') // User-facing: Spanish
      },
      onError: (error: any) => {
        const errorMessage = getApiErrorMessage(error)
        console.error('❌ Error en update mutation:', error.response?.data || error.message || error)
        toast.error(`Error al actualizar: ${errorMessage}`) // User-facing: Spanish
      }
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => {
        console.log('✅ Eliminación exitosa, invalidando queries...')

        qc.invalidateQueries({
          queryKey: [queryKeyPrefix],
          exact: false
        })

        toast.success(opts?.messages?.deleted?.() ?? 'Eliminado correctamente') // User-facing: Spanish
      },
      onError: (error: any) => {
        const errorMessage = getApiErrorMessage(error)
        console.error('❌ Error en delete mutation:', error.response?.data || error.message || error)
        toast.error(`Error al eliminar: ${errorMessage}`) // User-facing: Spanish
      }
    })
  }

  return { useList, useOne, useCreate, useUpdate, useRemove }
}
