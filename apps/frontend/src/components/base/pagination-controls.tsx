'use client'

import { Button } from '@una-gc/ui/components/button'

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationControlsProps {
  pagination: PaginationInfo
  itemsCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
  itemLabel?: string
}

export function PaginationControls({
  pagination,
  itemsCount,
  onPageChange,
  disabled = false,
  itemLabel = 'elementos'
}: PaginationControlsProps) {
  const { page, total, totalPages } = pagination

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Mostrando {itemsCount} de {total} {itemLabel}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
          Anterior
        </Button>
        <div className="text-sm">
          Página {page} de {totalPages}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
