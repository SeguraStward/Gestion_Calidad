'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@una-gc/ui/components/table'
import { ReactNode } from 'react'

export interface DataListColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  width?: string
}

export interface DataListProps<T> {
  items: T[]
  columns: DataListColumn<T>[]
  loading?: boolean
  error?: Error | null
  emptyMessage?: string
  loadingMessage?: string
  keyExtractor?: (item: T, index: number) => string
  actions?: (item: T) => ReactNode
}

export function DataList<T>({
  items,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No hay datos disponibles',
  loadingMessage = 'Cargando...',
  keyExtractor = (_, index) => index.toString(),
  actions
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">{loadingMessage}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.width}>
                {column.header}
              </TableHead>
            ))}
            {actions && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={keyExtractor(item, index)}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.cell(item)}</TableCell>
              ))}
              {actions && <TableCell>{actions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
