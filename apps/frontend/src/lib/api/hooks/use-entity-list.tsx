'use client'

import { useEffect, useState } from 'react'

export interface PaginatedData<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UseEntityListOptions<TFilters> {
  initialFilters?: TFilters
  initialPage?: number
  initialLimit?: number
  autoLoad?: boolean
}

export interface UseEntityListReturn<T, TFilters> {
  // Data
  data: PaginatedData<T>
  loading: boolean
  error: Error | null

  // Filters
  filters: TFilters
  setFilters: (filters: TFilters) => void
  updateFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void
  clearFilters: (defaultFilters?: TFilters) => void

  // Pagination
  setPage: (page: number) => void
  setLimit: (limit: number) => void

  // Actions
  load: () => Promise<void>
  refresh: () => Promise<void>
}

export function useEntityList<T, TFilters extends Record<string, any>>(
  loadFunction: (filters: TFilters, page: number, limit: number) => Promise<PaginatedData<T>>,
  options: UseEntityListOptions<TFilters> = {}
): UseEntityListReturn<T, TFilters> {
  const { initialFilters = {} as TFilters, initialPage = 1, initialLimit = 10, autoLoad = true } = options

  const [data, setData] = useState<PaginatedData<T>>({
    items: [],
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<TFilters>(initialFilters)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loadFunction(filters, data.page, data.limit)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await load()
  }

  const updateFilter = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = (defaultFilters?: TFilters) => {
    setFilters(defaultFilters || ({} as TFilters))
  }

  const setPage = (page: number) => {
    setData((prev) => ({ ...prev, page }))
  }

  const setLimit = (limit: number) => {
    setData((prev) => ({ ...prev, limit, page: 1 }))
  }

  useEffect(() => {
    if (autoLoad) {
      load()
    }
  }, [filters, data.page, data.limit])

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    setPage,
    setLimit,
    load,
    refresh
  }
}
