'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash, Check, X, UserCog, Shield, Mail } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from '@una-gc/ui/components/dropdown-menu'
import { OptimizedDataTable, useOptimizedColumns } from '@/components/ui/optimized-data-table'
import { StatusBadge } from '@/components/base'
import { User } from '../types/user.types'

interface UserTableProps {
  data: User[]
  isLoading: boolean
  canUpdate: boolean
  canDelete: boolean
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  onDelete: (user: User) => void
  onManageRoles: (user: User) => void
  // Agregar props de paginación
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

/**
 * User table component for displaying and managing users
 */
export function UserTable({
  data,
  isLoading,
  canUpdate,
  canDelete,
  onEdit,
  onToggleStatus,
  onDelete,
  onManageRoles,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: UserTableProps) {
  const columns = useOptimizedColumns(() => {
    const cols: ColumnDef<User>[] = [
      {
        accessorKey: 'fullName',
        header: 'Nombre',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.fullName} {row.original.fullLastName || ''}</span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Mail className="h-3 w-3 mr-1" /> {row.original.email}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles?.map(role => (
              <span key={role.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                {role.name}
              </span>
            )) || (
                <span className="text-xs text-muted-foreground">Sin roles</span>
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
          <div className="flex justify-center" data-no-row-click>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" className="z-[9999]">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  {canUpdate && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageRoles(row.original)}>
                        <Shield className="mr-2 h-4 w-4" /> Gestionar roles
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
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.original)}>
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        )
      }
    ]
    return cols
  }, [canUpdate, canDelete, onEdit, onToggleStatus, onDelete, onManageRoles])

  return (
    <OptimizedDataTable
      data={data || []}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Buscar usuarios..."
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      serverSideFiltering={true}
    />
  )
}
