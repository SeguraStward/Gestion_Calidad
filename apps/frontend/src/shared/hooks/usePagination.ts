import { useState, useMemo, useCallback } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialItemsPerPage?: number
}

export function usePagination({ initialPage = 1, initialItemsPerPage = 10 }: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0) {
      setCurrentPage(newPage)
    }
  }, [])

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  // Actualiza el texto de búsqueda y resetea a página 1
  const updateSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  // Actualiza filtros adicionales (dropdowns, etc.) y resetea a página 1
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  // Values to be used in API query — incluye search y filtros si existen
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      ...(search.trim() && { search: search.trim() }),
      ...filters,
    }),
    [currentPage, itemsPerPage, search, filters]
  )

  return {
    currentPage,
    setCurrentPage: handlePageChange,
    itemsPerPage,
    setItemsPerPage,
    queryParams,
    resetPagination,
    search,
    updateSearch,
    filters,
    updateFilters,
  }
}
