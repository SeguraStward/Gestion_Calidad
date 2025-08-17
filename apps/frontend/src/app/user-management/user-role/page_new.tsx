'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'

import { AlertMessage } from '@/app/(components)/ui/alert-message'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'

// Import from the new module structure
import { RoleTable } from '@/modules/user-management/user-role/components/role-table'
import { RoleFiltersComponent } from '@/modules/user-management/user-role/components/role-filters'
import {
  UserRole,
  UserRoleFilters
} from '@/modules/user-management/user-role/types/user-role.types'
import {
  useUserRoles,
  useDeleteUserRole,
  useUpdateUserRole
} from '@/modules/user-management/user-role/service/user-role.service'

/**
 * Role management page - lists all roles and provides actions to manage them
 */
export default function RoleListPage() {
  const router = useRouter()
  const { hasPermission } = useAuth()
  const [filters, setFilters] = useState<UserRoleFilters>({})
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const canCreate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_ROLE, ACTIONS.CREATE, SCOPES.ALL)
  const canUpdate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_ROLE, ACTIONS.UPDATE, SCOPES.ALL)
  const canDelete = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_ROLE, ACTIONS.DELETE, SCOPES.ALL)

  // Query for paginated roles with filters
  const { data, isLoading, refetch } = useUserRoles(filters)

  // Delete mutation
  const { mutate: deleteRole } = useDeleteUserRole()

  // Update mutation
  const { mutate: updateRole } = useUpdateUserRole()

  /**
   * Handles role deletion after confirmation
   */
  const handleDeleteRole = () => {
    if (selectedRole) {
      deleteRole(selectedRole.id, {
        onSuccess: () => {
          refetch()
          setShowDeleteDialog(false)
          setSelectedRole(null)
        }
      })
    }
  }

  /**
   * Toggles role active status
   */
  const handleToggleStatus = (role: UserRole) => {
    const newStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateRole({
      id: role.id,
      data: { status: newStatus }
    }, {
      onSuccess: () => refetch()
    })
  }

  /**
   * Navigates to role edit page
   */
  const handleEditRole = (role: UserRole) => {
    router.push(`/user-management/user-role/${role.id}`)
  }

  /**
   * Navigates to role permissions page
   */
  const handleManagePermissions = (role: UserRole) => {
    router.push(`/user-management/user-role/${role.id}/permissions`)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>

        {canCreate && (
          <Button onClick={() => router.push('/user-management/user-role/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Rol
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles de Usuario</CardTitle>
          <CardDescription>
            Administra los roles del sistema y sus permisos asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={() => refetch()}
            onClear={() => {
              setFilters({})
              refetch()
            }}
          />

          <div className="mt-4">
            <RoleTable
              data={data?.data || []}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={handleEditRole}
              onToggleStatus={handleToggleStatus}
              onDelete={(role) => {
                setSelectedRole(role)
                setShowDeleteDialog(true)
              }}
              onManagePermissions={handleManagePermissions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertMessage
        title="¿Eliminar rol?"
        description={`¿Está seguro que desea eliminar el rol "${selectedRole?.name}"? Esta acción puede afectar a los usuarios que tienen este rol asignado.`}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteRole}
        variant="danger"
      />
    </div>
  )
}
