'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'

import { AlertMessage } from '@/app/(components)/ui/alert-message'
import { useAuth } from '@/modules/auth/hooks/useAuth'

// Import from the new module structure
import { PermissionTable } from '@/modules/user-management/user-permission/components/permission-table'
import { PermissionFilters } from '@/modules/user-management/user-permission/components/permission-filters'
import {
  UserPermission,
  UserPermissionFilters
} from '@/modules/user-management/user-permission/types/user-permission.types'
import {
  useUserPermissions,
  useDeleteUserPermission,
  useUpdateUserPermission
} from '@/modules/user-management/user-permission/service/user-permission.service'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'

/**
 * Permission management page - lists all permissions and provides actions to manage them
 */
export default function PermissionListPage() {
  const router = useRouter()
  const { hasPermission } = useAuth()
  const [filters, setFilters] = useState<UserPermissionFilters>({
    page: 1,
    limit: 10
  })
  const [selectedPermission, setSelectedPermission] = useState<UserPermission | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Permissions for ADMIN users
  const canCreate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_PERMISSION, ACTIONS.CREATE, SCOPES.ALL)
  const canUpdate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_PERMISSION, ACTIONS.UPDATE, SCOPES.ALL)
  const canDelete = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_PERMISSION, ACTIONS.DELETE, SCOPES.ALL)

  // Query for paginated permissions with filters
  const { data, isLoading, refetch } = useUserPermissions(filters)

  // Delete mutation
  const { mutate: deletePermission } = useDeleteUserPermission()

  // Update mutation
  const { mutate: updatePermission } = useUpdateUserPermission()

  /**
   * Handles page change for pagination
   */
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  /**
   * Handles permission deletion after confirmation
   */
  const handleDeletePermission = () => {
    if (selectedPermission) {
      deletePermission(selectedPermission.id, {
        onSuccess: () => {
          refetch()
          setShowDeleteDialog(false)
          setSelectedPermission(null)
        }
      })
    }
  }

  /**
   * Toggles permission active status
   */
  const handleToggleStatus = (permission: UserPermission) => {
    const newStatus = permission.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updatePermission({
      id: permission.id,
      data: { status: newStatus }
    }, {
      onSuccess: () => refetch()
    })
  }

  /**
   * Navigates to permission edit page
   */
  const handleEditPermission = (permission: UserPermission) => {
    router.push(`/user-management/user-permission/${permission.id}`)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>

        {canCreate && (
          <Button onClick={() => router.push('/user-management/user-permission/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Permiso
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permisos del Sistema</CardTitle>
          <CardDescription>
            Administra los permisos disponibles para asignar a roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={() => refetch()}
            onClear={() => {
              setFilters({ page: 1, limit: 10 })
              refetch()
            }}
          />

          <div className="mt-4">
            <PermissionTable
              data={data?.data || []}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={handleEditPermission}
              onToggleStatus={handleToggleStatus}
              onDelete={(permission) => {
                setSelectedPermission(permission)
                setShowDeleteDialog(true)
              }}
              currentPage={data?.meta?.page || 1}
              totalPages={Math.ceil((data?.meta?.total || 0) / (data?.meta?.limit || 10))}
              totalItems={data?.meta?.total || 0}
              pageSize={data?.meta?.limit || 10}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertMessage
        title="¿Eliminar permiso?"
        description={`¿Está seguro que desea eliminar el permiso "${selectedPermission?.name}"? Esta acción puede afectar a los roles que utilizan este permiso.`}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeletePermission}
        variant="danger"
      />
    </div>
  )
}