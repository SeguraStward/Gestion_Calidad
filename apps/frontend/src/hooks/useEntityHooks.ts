import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useMemo } from 'react'

interface EntityHooksConfig<TEntity, TCreateInput, TUpdateInput, TFilters extends Record<string, any>> {
  entityName: string
  service: {
    list: (filters?: TFilters) => Promise<{ data: TEntity[] }>
    getOne: (id: string) => Promise<{ data: TEntity }>
    create: (data: TCreateInput) => Promise<{ data: TEntity }>
    update: (id: string, data: TUpdateInput) => Promise<{ data: TEntity }>
    delete: (id: string) => Promise<void>
  }
  options?: {
    staleTime?: number
    gcTime?: number
    defaultLimit?: number
    messages?: {
      createSuccess?: string
      updateSuccess?: string
      deleteSuccess?: string
      createError?: string
      updateError?: string
      deleteError?: string
    }
  }
}

/**
 * Factory to create optimized CRUD entity hooks.
 * Reduces code duplication and standardizes patterns.
 */
export function createEntityHooks<
  TEntity extends { id: string },
  TCreateInput,
  TUpdateInput = Partial<TCreateInput>,
  TFilters extends Record<string, any> = Record<string, any>
>(config: EntityHooksConfig<TEntity, TCreateInput, TUpdateInput, TFilters>) {
  const { entityName, service, options = {} } = config
  const { staleTime = 10 * 60 * 1000, gcTime = 15 * 60 * 1000, defaultLimit = 50, messages = {} } = options

  // List hook
  function useList(filters?: TFilters, queryOptions?: Partial<UseQueryOptions<{ data: TEntity[] }, Error, TEntity[]>>) {
    const queryKey = useMemo(() => [entityName, 'list', filters], [filters])

    return useQuery({
      queryKey,
      queryFn: () => {
        const filtersWithLimit = {
          ...(filters || {}),
          limit: defaultLimit
        } as TFilters & { limit: number }
        return service.list(filtersWithLimit)
      },
      staleTime,
      gcTime,
      placeholderData: (previousData) => previousData,
      ...queryOptions
    })
  }

  // Get one hook
  function useOne(id: string | null, queryOptions?: Partial<UseQueryOptions<{ data: TEntity }, Error, TEntity>>) {
    const queryKey = useMemo(() => [entityName, 'one', id], [id])

    return useQuery({
      queryKey,
      queryFn: () => service.getOne(id!),
      enabled: !!id,
      staleTime,
      gcTime,
      ...queryOptions
    })
  }

  // Create hook
  function useCreate(mutationOptions?: Partial<UseMutationOptions<{ data: TEntity }, Error, TCreateInput>>) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: service.create,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        if (data.data.id) {
          queryClient.setQueryData([entityName, 'one', data.data.id], data)
        }
        toast.success(messages.createSuccess || `${entityName} created successfully`)
      },
      onError: (error) => {
        console.error(`Error creating ${entityName}:`, error)
        toast.error(messages.createError || `Error creating ${entityName}`)
      },
      ...mutationOptions
    })
  }

  // Update hook
  function useUpdate(
    mutationOptions?: Partial<UseMutationOptions<{ data: TEntity }, Error, { id: string; data: TUpdateInput }>>
  ) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.setQueryData([entityName, 'one', variables.id], data)
        toast.success(messages.updateSuccess || `${entityName} updated successfully`)
      },
      onError: (error) => {
        console.error(`Error updating ${entityName}:`, error)
        toast.error(messages.updateError || `Error updating ${entityName}`)
      },
      ...mutationOptions
    })
  }

  // Delete hook
  function useDelete(mutationOptions?: Partial<UseMutationOptions<void, Error, string>>) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: service.delete,
      onSuccess: (_, deletedId) => {
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.removeQueries({ queryKey: [entityName, 'one', deletedId] })
        toast.success(messages.deleteSuccess || `${entityName} deleted successfully`)
      },
      onError: (error) => {
        console.error(`Error deleting ${entityName}:`, error)
        toast.error(messages.deleteError || `Error deleting ${entityName}`)
      },
      ...mutationOptions
    })
  }

  // Prefetch utilities
  function usePrefetch() {
    const queryClient = useQueryClient()
    return {
      prefetchList: (filters?: TFilters) =>
        queryClient.prefetchQuery({
          queryKey: [entityName, 'list', filters],
          queryFn: () => service.list(filters),
          staleTime
        }),
      prefetchOne: (id: string) =>
        queryClient.prefetchQuery({
          queryKey: [entityName, 'one', id],
          queryFn: () => service.getOne(id),
          staleTime
        })
    }
  }

  // Query key utilities
  const queryKeys = {
    all: [entityName],
    lists: () => [entityName, 'list'],
    list: (filters?: TFilters) => [entityName, 'list', filters],
    details: () => [entityName, 'one'],
    detail: (id: string) => [entityName, 'one', id]
  }

  return {
    useList,
    useOne,
    useCreate,
    useUpdate,
    useDelete,
    usePrefetch,
    queryKeys
  }
}
