'use client'

import { useDebounce } from '@/shared/hooks/use-debounce' // Necesitamos crear este hook
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  Table as TanstackTable,
  useReactTable
} from '@tanstack/react-table'
import * as React from 'react'

import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@una-gc/ui/components/table'
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react' // Added Loader2

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  newButton?: React.ReactNode
  isLoading?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  serverSideFiltering?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  // Optional: when omitted the search input is not rendered at all. Previously
  // it defaulted to "Buscar...", which left dead inputs in tables that don't
  // wire up a search handler.
  searchPlaceholder,
  newButton,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  searchQuery,
  onSearchChange,
  serverSideFiltering = false
}: DataTableProps<TData, TValue>) {
  // Estado para filtrado del lado del cliente
  const [clientFilter, setClientFilter] = React.useState('')

  // Aplicamos debounce solo para filtrado del lado del cliente
  const debouncedClientFilter = useDebounce(clientFilter, 300)

  // Determinar el valor actual del input
  const inputValue = React.useMemo(() => {
    return serverSideFiltering ? (searchQuery ?? '') : clientFilter
  }, [serverSideFiltering, searchQuery, clientFilter])

  // Manejar cambios en la búsqueda con useCallback para evitar recreaciones
  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      if (serverSideFiltering && onSearchChange) {
        // Para filtrado del lado del servidor, propagamos inmediatamente
        onSearchChange(value)
      } else {
        // Para filtrado del lado del cliente
        setClientFilter(value)
      }
    },
    [serverSideFiltering, onSearchChange]
  )

  // Tabla con filtrado del lado del cliente
  const tableOptions: any = {
    data,
    columns,
    state: {
      globalFilter: serverSideFiltering ? undefined : debouncedClientFilter
    },
    onGlobalFilterChange: serverSideFiltering ? undefined : setClientFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSideFiltering ? undefined : getFilteredRowModel(),
    manualFiltering: serverSideFiltering,
    manualPagination: serverSideFiltering
  }

  const table = useReactTable(tableOptions)

  // Deshabilitar paginación si no hay handler
  const paginacionActiva = typeof onPageChange === 'function' && totalPages > 1

  return (
    <div>
      {(searchPlaceholder !== undefined || newButton) && (
        <div className="flex items-center justify-between mb-4">
          {searchPlaceholder !== undefined ? (
            <div className="relative max-w-sm flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder={searchPlaceholder}
                value={inputValue}
                onChange={handleSearchChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div />
          )}
          {newButton}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                    Cargando datos...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('[data-no-row-click]')) {
                      return
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {serverSideFiltering && totalItems > 0 ? (
            <>
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a {Math.min(currentPage * pageSize, totalItems)}{' '}
              de {totalItems} registros
            </>
          ) : (
            `Página ${currentPage} de ${totalPages}`
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginacionActiva && onPageChange && onPageChange(currentPage - 1)}
            disabled={!paginacionActiva || currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginacionActiva && onPageChange && onPageChange(currentPage + 1)}
            disabled={!paginacionActiva || currentPage >= totalPages || isLoading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
