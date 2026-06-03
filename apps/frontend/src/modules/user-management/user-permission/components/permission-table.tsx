'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash, Check, X } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@una-gc/ui/components/dropdown-menu'
import { OptimizedDataTable, useOptimizedColumns } from '@/components/ui/optimized-data-table'
import { StatusBadge } from '@/components/base'
import { UserPermission } from '../types/user-permission.types'

interface PermissionTableProps {
  data: UserPermission[]
  isLoading: boolean
  canUpdate: boolean
  canDelete: boolean
  onEdit: (permission: UserPermission) => void
  onToggleStatus: (permission: UserPermission) => void
  onDelete: (permission: UserPermission) => void
  // Pagination props
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

/**
 * Permission table component for displaying and managing user permissions
 */
export function PermissionTable({
  data,
  isLoading,
  canUpdate,
  canDelete,
  onEdit,
  onToggleStatus,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: PermissionTableProps) {
  const columns = useOptimizedColumns(() => {
    const cols: ColumnDef<UserPermission>[] = [
      {
        accessorKey: 'code',
        header: 'Código',
        cell: ({ row }) => (
          <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
            {row.original.code}
          </div>
        )
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.status} />
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {canUpdate && (
                <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
                  {row.original.status === 'ACTIVE' ? (
                    <>
                      <X className="mr-2 h-4 w-4 text-destructive" /> Desactivar
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" /> Activar
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ]
    return cols
  }, [canUpdate, canDelete, onEdit, onToggleStatus, onDelete])

  return (
    <OptimizedDataTable
      data={data || []}
      columns={columns}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  )
}