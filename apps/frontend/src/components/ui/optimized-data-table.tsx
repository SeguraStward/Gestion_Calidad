import { DataTable } from '@/app/(components)/ui/data-table'
import { VirtualizedDataTable } from '@/components/ui/virtualized-data-table'
import { memo, useMemo } from 'react'

interface OptimizedDataTableProps<T> {
  data: T[]
  columns: any[]
  isLoading?: boolean
  searchPlaceholder?: string
  newButton?: React.ReactNode
  virtualized?: boolean
  virtualizationThreshold?: number
  className?: string
  // Agregar props de paginación
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  serverSideFiltering?: boolean
}

/**
 * Componente DataTable optimizado con memoización y virtualización automática
 * Se decide automáticamente si usar virtualización basado en el tamaño de los datos
 */
export const OptimizedDataTable = memo(function OptimizedDataTable<T>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder,
  newButton,
  virtualized = false,
  virtualizationThreshold = 100,
  className,
  // Props de paginación
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  searchQuery,
  onSearchChange,
  serverSideFiltering = false
}: OptimizedDataTableProps<T>) {
  // Memoizar las columnas para evitar re-renders innecesarios
  const memoizedColumns = useMemo(() => columns, [columns])

  // Memoizar los datos para evitar re-renders cuando no han cambiado
  const memoizedData = useMemo(() => data, [data])

  // Decidir automáticamente si usar virtualización
  const shouldVirtualize = useMemo(() => {
    return virtualized || memoizedData.length > virtualizationThreshold
  }, [virtualized, memoizedData.length, virtualizationThreshold])

  // Callback memoizado para el botón nuevo
  const memoizedNewButton = useMemo(() => newButton, [newButton])

  if (shouldVirtualize) {
    return (
      <VirtualizedDataTable
        data={memoizedData}
        columns={memoizedColumns}
        isLoading={isLoading}
        searchPlaceholder={searchPlaceholder ?? ''}
        newButton={memoizedNewButton}
        className={className ?? ''}
      />
    )
  }

  return (
    <DataTable<T, any>
      data={memoizedData}
      columns={memoizedColumns}
      isLoading={isLoading}
      searchPlaceholder={searchPlaceholder ?? ''}
      newButton={memoizedNewButton}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      serverSideFiltering={serverSideFiltering}
    />
  )
})

/**
 * Hook para optimizar columnas de tabla
 * Evita recreación innecesaria de definiciones de columnas
 */
export function useOptimizedColumns(columnDefinitions: () => any[], dependencies: any[] = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(columnDefinitions, dependencies)
}

/**
 * Hook para optimizar datos de tabla
 * Proporciona memoización y filtrado optimizado
 */
export function useOptimizedTableData<T>(data: T[], searchTerm: string = '', searchFields: (keyof T)[] = []) {
  return useMemo(() => {
    if (!searchTerm.trim()) return data

    const searchLower = searchTerm.toLowerCase()

    return data.filter((item) => {
      // Si se especifican campos, buscar solo en esos campos
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(searchLower)
        })
      }

      // Si no se especifican campos, buscar en todos los valores del objeto
      return Object.values(item as any).some((value) => value && value.toString().toLowerCase().includes(searchLower))
    })
  }, [data, searchTerm, searchFields])
}

export default OptimizedDataTable
