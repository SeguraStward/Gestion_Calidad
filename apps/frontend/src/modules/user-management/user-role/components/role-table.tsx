'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash, Check, X, Shield } from 'lucide-react'
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
import { UserRole } from '../types/user-role.types'

interface RoleTableProps {
  data: UserRole[]
  isLoading: boolean
  canUpdate: boolean
  canDelete: boolean
  onEdit: (role: UserRole) => void
  onToggleStatus: (role: UserRole) => void
  onDelete: (role: UserRole) => void
  onManagePermissions: (role: UserRole) => void
  // Pagination props
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

/**
 * Role table component for displaying and managing user roles
 */
export function RoleTable({
  data,
  isLoading,
  canUpdate,
  canDelete,
  onEdit,
  onToggleStatus,
  onDelete,
  onManagePermissions,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: RoleTableProps) {
  const columns = useOptimizedColumns(() => {
    const cols: ColumnDef<UserRole>[] = [
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
        accessorKey: 'permissions',
        header: 'Permisos',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.permissions?.length || 0} permisos asignados
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.status || 'INACTIVE'} />
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
                <>
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onManagePermissions(row.original)}>
                    <Shield className="mr-2 h-4 w-4" /> Gestionar permisos
                  </DropdownMenuItem>
                </>
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
  }, [canUpdate, canDelete, onEdit, onToggleStatus, onDelete, onManagePermissions])

  return (
    <OptimizedDataTable
      data={data || []}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Buscar roles..."
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  )
}
