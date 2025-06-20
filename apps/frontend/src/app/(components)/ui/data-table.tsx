'use client'

import * as React from 'react'
import { useDebounce } from '@/shared/hooks/use-debounce' // Necesitamos crear este hook
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  Table as TanstackTable, // Alias to avoid naming conflict
  Row
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@una-gc/ui/components/table'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react' // Added Loader2

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  newButton?: React.ReactNode
  isLoading?: boolean 
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  // Nuevas props para filtrado del lado del servidor
  searchQuery?: string
  onSearchChange?: (query: string) => void
  // Flag para determinar si el filtrado es en cliente o servidor
  serverSideFiltering?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  newButton,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchQuery,
  onSearchChange,
  serverSideFiltering = false
}: DataTableProps<TData, TValue>) {
  // Estado para filtrado del lado del cliente
  const [clientFilter, setClientFilter] = React.useState('')
  
  // Aplicamos debounce a la búsqueda para evitar muchas solicitudes
  const debouncedClientFilter = useDebounce(clientFilter, 300)
  
  // Manejar cambios en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (serverSideFiltering && onSearchChange) {
      // Para filtrado del lado del servidor, propagamos el cambio hacia arriba
      setClientFilter(value) // Actualizamos el input localmente
      onSearchChange(value)  // Enviamos el valor al componente padre
    } else {
      // Para filtrado del lado del cliente
      setClientFilter(value)
    }
  }
  
  // Tabla con filtrado del lado del cliente
  const table: TanstackTable<TData> = useReactTable({
    data,
    columns,
    state: {
      globalFilter: serverSideFiltering ? undefined : debouncedClientFilter
    },
    onGlobalFilterChange: serverSideFiltering ? undefined : setClientFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSideFiltering ? undefined : getFilteredRowModel(),
    // No necesitamos filtrado en la tabla si lo hacemos en el servidor
  })

  // Deshabilitar paginación si no hay handler
  const paginacionActiva = typeof onPageChange === 'function' && totalPages > 1

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative max-w-sm flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder={searchPlaceholder}
            value={serverSideFiltering ? searchQuery : clientFilter}
            onChange={handleSearchChange}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        {newButton}
      </div>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} onClick={undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
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
          Página {currentPage} de {totalPages}
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
