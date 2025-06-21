import { memo, useMemo, useState, useCallback, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DataTable } from '@/app/(components)/ui/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface VirtualizedDataTableProps<T> {
  data: T[]
  columns: any[]
  isLoading?: boolean
  searchPlaceholder?: string
  newButton?: React.ReactNode
  rowHeight?: number
  overscan?: number
  className?: string
}

/**
 * Componente DataTable virtualizado para manejar grandes conjuntos de datos
 * Optimizado para performance con memoización y virtualización
 */
export const VirtualizedDataTable = memo(function VirtualizedDataTable<T>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder,
  newButton,
  rowHeight = 64,
  overscan = 10,
  className
}: VirtualizedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar datos por término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    return data.filter((item) => {
      return Object.values(item as any).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [data, searchTerm])

  // Si hay pocos registros, usar DataTable normal
  if (filteredData.length <= 100) {
    return (
      <DataTable<T, any>
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder={searchPlaceholder}
        newButton={newButton}
      />
    )
  }

  // Para grandes conjuntos de datos, usar virtualización
  return (
    <div className={className}>
      {/* Header con búsqueda y botón nuevo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder={searchPlaceholder || 'Buscar...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        {newButton && <div className="ml-4">{newButton}</div>}
      </div>

      {/* Tabla virtualizada */}
      <VirtualizedTable data={filteredData} columns={columns} rowHeight={rowHeight} overscan={overscan} isLoading={isLoading} />
    </div>
  )
})

// Componente interno para la tabla virtualizada
const VirtualizedTable = memo(function VirtualizedTable({
  data,
  columns,
  rowHeight,
  overscan,
  isLoading
}: {
  data: any[]
  columns: any[]
  rowHeight: number
  overscan: number
  isLoading: boolean
}) {
  const parentRef = useRef<HTMLDivElement | null>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan
  })

  const items = virtualizer.getVirtualItems()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border rounded-md"
      style={{
        contain: 'strict'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Header de la tabla */}
        <div className="sticky top-0 z-10 bg-muted/50 border-b" style={{ height: rowHeight }}>
          <div className="flex items-center h-full px-4 font-medium text-sm">
            {columns.map((column, index) => (
              <div
                key={index}
                className="flex-1 text-left"
                style={{
                  width: (column as any).size ? `${(column as any).size}px` : 'auto'
                }}
              >
                {typeof column.header === 'string'
                  ? column.header
                  : typeof column.header === 'function'
                    ? column.header({} as any)
                    : column.header}
              </div>
            ))}
          </div>
        </div>

        {/* Filas virtualizadas */}
        {items.map((virtualItem) => {
          const item = data[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full border-b hover:bg-muted/50 transition-colors"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <div className="flex items-center h-full px-4 text-sm">
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex-1"
                    style={{
                      width: (column as any).size ? `${(column as any).size}px` : 'auto'
                    }}
                  >
                    {typeof column.cell === 'function'
                      ? column.cell({ row: { original: item } } as any)
                      : (item as any)[(column as any).accessorKey]}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default VirtualizedDataTable
