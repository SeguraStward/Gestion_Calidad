import { UseQueryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { GenericService } from './generic.service'
import type { PaginatedResponse } from '../interfaces'

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
  function useOne(id: string, filters?: Filters, options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn' | 'enabled'>) {
    return useQuery({
      queryKey: [queryKeyPrefix, id, filters],
      queryFn: () => service.get(id, filters as Filters),
      enabled: !!id,
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

        toast.success(opts?.messages?.created?.(data) ?? 'Creado exitosamente')
      },
      onError: (error: any) => {
        console.error('❌ Error en mutation:', error)
        toast.error(`Error al crear: ${error.message || 'Error desconocido'}`)
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

        toast.success(opts?.messages?.updated?.(data) ?? 'Actualizado correctamente')
      },
      onError: (error: any) => {
        console.error('❌ Error en update mutation:', error)
        toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`)
      }
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => {
        console.log('✅ Eliminación exitosa, invalidando queries...')

        // Invalidar todas las queries relacionadas
        qc.invalidateQueries({
          queryKey: [queryKeyPrefix],
          exact: false
        })

        toast.success(opts?.messages?.deleted?.() ?? 'Eliminado correctamente')
      },
      onError: (error: any) => {
        console.error('❌ Error en delete mutation:', error)
        toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`)
      }
    })
  }

  return { useList, useOne, useCreate, useUpdate, useRemove }
}
