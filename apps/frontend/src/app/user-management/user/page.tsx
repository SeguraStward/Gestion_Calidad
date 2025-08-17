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
import { UserTable } from '@/modules/user-management/user/components/user-table'
import { UserFiltersComponent } from '@/modules/user-management/user/components/user-filters'
import {
  User,
  UserFilters
} from '@/modules/user-management/user/types/user.types'
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus
} from '@/modules/user-management/user/service/user.service'
import { useUserRoles } from '@/modules/user-management/user-role/service/user-role.service'

/**
 * User management page - lists all users and provides actions to manage them
 */
export default function UserListPage() {
  const router = useRouter()
  const { hasPermission } = useAuth()
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const canCreate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.CREATE, SCOPES.ALL)
  const canUpdate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.UPDATE, SCOPES.ALL)
  const canDelete = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.DELETE, SCOPES.ALL)

  // Query for paginated users with filters
  const { data, isLoading, refetch } = useUsers(filters)

  // Get all roles for filter dropdown
  const { data: rolesData } = useUserRoles({ limit: 1000 })

  // Delete mutation
  const { mutate: deleteUser } = useDeleteUser()

  // Status update mutation
  const { mutate: updateStatus } = useUpdateUserStatus()

  /**
   * Maneja el cambio de página
   */
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  /**
   * Maneja el cambio de filtros
   */
  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  /**
   * Handles user deletion after confirmation
   */
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id, {
        onSuccess: () => {
          refetch()
          setShowDeleteDialog(false)
          setSelectedUser(null)
        }
      })
    }
  }

  /**
   * Toggles user active status
   */
  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateStatus({ userId: user.id, status: newStatus }, {
      onSuccess: () => refetch()
    })
  }

  /**
   * Navigates to user edit page
   */
  const handleEditUser = (user: User) => {
    router.push(`/user-management/user/${user.id}`)
  }

  /**
   * Navigates to user roles assignment page
   */
  const handleManageRoles = (user: User) => {
    router.push(`/user-management/user/${user.id}/roles`)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>

        {canCreate && (
          <Button onClick={() => router.push('/user-management/user/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Administra los usuarios del sistema y sus roles asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserFiltersComponent
            filters={filters}
            roles={rolesData?.data || []}
            onFiltersChange={handleFiltersChange}
            onSearch={() => refetch()}
            onClear={() => {
              setFilters({ page: 1, limit: 10 })
              refetch()
            }}
          />

          <div className="mt-4">
            <UserTable
              data={data?.data || []}
              isLoading={isLoading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={handleEditUser}
              onToggleStatus={handleToggleStatus}
              onDelete={(user) => {
                setSelectedUser(user)
                setShowDeleteDialog(true)
              }}
              onManageRoles={handleManageRoles}
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
        title="¿Eliminar usuario?"
        description={`¿Está seguro que desea eliminar a "${selectedUser?.fullName}"? Esta acción no se puede deshacer.`}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteUser}
        variant="danger"
      />
    </div>
  )
}