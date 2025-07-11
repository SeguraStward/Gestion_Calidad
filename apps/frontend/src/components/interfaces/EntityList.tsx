import React from 'react'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Button,
  Input,
  Select,
  Skeleton,
  Alert
} from '@una-gc/ui/components'
import { Spinner } from '../base/spiner'
import { Pagination } from '../base/pagination'

interface EntityListProps<T, TFilters> {
  columns: { key: keyof T | string; label: string; render?: (item: T) => React.ReactNode }[]
  items: T[]
  loading?: boolean
  error?: string | null
  filters?: TFilters
  onFilterChange?: (filters: TFilters) => void
  onSearch?: (term: string) => void
  searchPlaceholder?: string
  page: number
  limit: number
  total: number
  totalPages: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  actions?: (item: T) => React.ReactNode
  emptyMessage?: string
}

export function EntityList<T, TFilters = any>({
  columns,
  items,
  loading,
  error,
  filters,
  onFilterChange,
  onSearch,
  searchPlaceholder = 'Buscar...',
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  actions,
  emptyMessage = 'No hay datos para mostrar.'
}: EntityListProps<T, TFilters>) {
  // Render filters (simple example, customize as needed)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-2 items-center">
        {onSearch && <Input placeholder={searchPlaceholder} onChange={handleSearch} aria-label="Buscar" className="max-w-xs" />}
        {/* Puedes agregar más filtros aquí usando Select/Input según tus necesidades */}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-2">
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded border bg-background">
        <Table aria-label="Lista de entidades">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>{col.label}</TableCell>
              ))}
              {actions && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>{col.render ? col.render(item) : String((item as any)[col.key])}</TableCell>
                  ))}
                  {actions && <TableCell>{actions(item)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                <div className="flex justify-between items-center">
                  <span>
                    Mostrando {items.length} de {total}
                  </span>
                  <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange ?? (() => {})} />
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
