'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Separator } from '@una-gc/ui/components/separator'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Import types and services
import { User } from '@/modules/user-management/user/types/user.types'
import { UserRole } from '@/modules/user-management/user-role/types/user-role.types'
import { useUser, useGetUserRoles, useUpdateUserRoles } from '@/modules/user-management/user/service/user.service'
import { useUserRoles } from '@/modules/user-management/user-role/service/user-role.service'

/**
 * User Role Management Page
 * Allows assigning/removing roles for a specific user
 */

// Cache para evitar logs repetitivos
let loggedMissingStatusRoles = new Set<string>()

/**
 * Utility function to safely extract role status from potentially malformed data
 */
const getRoleStatus = (role: any): 'ACTIVE' | 'INACTIVE' => {
  // Primary: check for standard 'status' field
  if (role.status === 'ACTIVE' || role.status === 'INACTIVE') {
    return role.status
  }

  // Secondary: check for alternative 'state' field
  if (role.state === 'ACTIVE' || role.state === 'INACTIVE') {
    return role.state
  }

  // Tertiary: check for boolean 'active' field
  if (typeof role.active === 'boolean') {
    return role.active ? 'ACTIVE' : 'INACTIVE'
  }

  // Quaternary: check for 'enabled' field
  if (typeof role.enabled === 'boolean') {
    return role.enabled ? 'ACTIVE' : 'INACTIVE'
  }

  // Default fallback: assume ACTIVE if no status information is found
  // Only log once per role to avoid spam
  if (!loggedMissingStatusRoles.has(role.id)) {
    console.warn(`[UserRoleManagement] Backend missing status field for role "${role.name}". Expected fields: status, state, active, or enabled. Received keys:`, Object.keys(role))
    loggedMissingStatusRoles.add(role.id)
  }

  return 'ACTIVE'
}

export default function UserRoleManagementPage() {
  // Usar una verificación más simple - solo verificar que el usuario tenga un rol ADMINISTRADOR
  return (
    <ProtectedRoute>
      <UserRoleManagementContent />
    </ProtectedRoute>
  )
}

function UserRoleManagementContent() {
  const router = useRouter()
  const params = useParams()
  const { hasPermission, isLoading: isAuthLoading, user: currentUser, role: currentRole } = useAuth()

  const userId = params.id as string

  // Get user data
  const { data: user, isLoading: userLoading } = useUser(userId)

  // Get all available roles
  const { data: rolesData, isLoading: rolesLoading } = useUserRoles({ limit: 1000 })

  // Get user's current roles
  const { data: userRolesData, isLoading: userRolesLoading, refetch: refetchUserRoles } = useGetUserRoles(userId)

  // Update user roles mutation
  const updateUserRolesMutation = useUpdateUserRoles()

  // State hooks
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [initialRoles, setInitialRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Check permissions only when auth is loaded and we have a role
  const isPermissionsReady = !isAuthLoading && currentUser && currentRole
  const canUpdate = isPermissionsReady && (
    hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.UPDATE, SCOPES.ALL) ||
    currentRole?.name === 'ADMINISTRADOR'
  )

  // Verificación adicional de seguridad - solo administradores pueden gestionar roles
  useEffect(() => {
    if (!isAuthLoading && currentRole && currentRole.name !== 'ADMINISTRADOR') {
      console.warn('[UserRoleManagement] Access denied: User is not an administrator')
      toast.error('No tienes permisos para gestionar roles de usuario')
      router.push('/dashboard')
      return
    }
  }, [isAuthLoading, currentRole, router])

  // Initialize selected roles when user roles data loads
  useEffect(() => {
    if (userRolesData?.data) {
      // Check if it's the debug format with userRoles property
      if (userRolesData.data.userRoles && Array.isArray(userRolesData.data.userRoles)) {
        const currentRoleIds = userRolesData.data.userRoles.map((role: UserRole) => role.id)
        setSelectedRoles(currentRoleIds)
        setInitialRoles(currentRoleIds)
      }
      // Check if it's the normal format with data array
      else if (Array.isArray(userRolesData.data)) {
        const currentRoleIds = userRolesData.data.map((role: UserRole) => role.id)
        setSelectedRoles(currentRoleIds)
        setInitialRoles(currentRoleIds)
      }
    } else if (userRolesData && Array.isArray(userRolesData)) {
      const currentRoleIds = userRolesData.map((role: UserRole) => role.id)
      setSelectedRoles(currentRoleIds)
      setInitialRoles(currentRoleIds)
    }
  }, [userRolesData])

  // Debug roles data (only log once when data changes)
  useEffect(() => {
    const availableRoles = rolesData?.data || []
    const userCurrentRoles = (() => {
      if (userRolesData?.data?.userRoles && Array.isArray(userRolesData.data.userRoles)) {
        return userRolesData.data.userRoles
      } else if (Array.isArray(userRolesData?.data)) {
        return userRolesData.data
      } else if (Array.isArray(userRolesData)) {
        return userRolesData
      }
      return []
    })()

    if (availableRoles.length > 0) {
      const rolesWithStatus = availableRoles.filter(r => r.status)
      const missingStatusRoles = availableRoles.filter(r => !r.status)

      console.log('[UserRoleManagement] Backend API response analysis:', {
        totalRoles: availableRoles.length,
        userRoles: userCurrentRoles.length,
        rolesWithStatus: rolesWithStatus.length,
        rolesMissingStatus: missingStatusRoles.length,
        sampleRoleFields: availableRoles[0] ? Object.keys(availableRoles[0]) : [],
        backendFixed: missingStatusRoles.length === 0 ? '✅ Backend is now sending status field' : '❌ Backend still missing status field'
      })

      if (missingStatusRoles.length > 0) {
        console.warn('[UserRoleManagement] Backend API missing status field for roles:', missingStatusRoles.map(r => r.name))
      }
    }
  }, [rolesData?.data, userRolesData])

  // Debug logging
  console.log('[UserRoleManagement] Permission check:', {
    permission: USER_MANAGEMENT_PERMISSIONS.USER,
    action: ACTIONS.UPDATE,
    scope: SCOPES.ALL,
    canUpdate,
    isAuthLoading,
    isPermissionsReady,
    currentUser: !!currentUser,
    currentRole: currentRole?.name,
    isAdmin: currentRole?.name === 'ADMINISTRADOR'
  })

  // Early returns AFTER all hooks
  if (userLoading || rolesLoading || userRolesLoading || isAuthLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Usuario no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * Handle role selection change
   */
  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId])
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
    }
  }

  /**
   * Save role changes
   */
  const handleSaveRoles = async () => {
    console.log('[UserRoleManagement] Save clicked:', { canUpdate, hasChanges: hasChanges() })

    if (!canUpdate) {
      console.log('[UserRoleManagement] Permission denied')
      toast.error('No tienes permisos para modificar roles de usuario')
      return
    }

    setIsLoading(true)

    try {
      // Use the mutation to update user roles
      await updateUserRolesMutation.mutateAsync({
        userId: userId,
        roleIds: selectedRoles
      })

      // Update initial roles to reflect saved state
      setInitialRoles(selectedRoles)

      // Refetch user roles to ensure data consistency
      await refetchUserRoles()

      toast.success('Roles actualizados correctamente')
    } catch (error) {
      console.error('Error updating user roles:', error)
      toast.error('Error al actualizar los roles del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Check if there are unsaved changes
   */
  const hasChanges = () => {
    return JSON.stringify(selectedRoles.sort()) !== JSON.stringify(initialRoles.sort())
  }

  /**
   * Handle back navigation with unsaved changes warning
   */
  const handleBack = () => {
    if (hasChanges()) {
      const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Estás seguro que quieres salir?')
      if (!confirmLeave) return
    }
    router.back()
  }

  // Early returns AFTER all hooks and functions
  if (userLoading || rolesLoading || userRolesLoading || isAuthLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Usuario no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isPermissionsReady || !canUpdate) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground">No tienes permisos para gestionar roles de usuario</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableRoles = rolesData?.data || []
  // Handle both debug format and normal format
  const userCurrentRoles = (() => {
    if (userRolesData?.data?.userRoles && Array.isArray(userRolesData.data.userRoles)) {
      // Debug format: { user, activeRoleId, cookies, userRoles }
      return userRolesData.data.userRoles
    } else if (Array.isArray(userRolesData?.data)) {
      // Normal format: { data: [...] }
      return userRolesData.data
    } else if (Array.isArray(userRolesData)) {
      // Direct array format
      return userRolesData
    }
    return []
  })()

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestionar Roles</h1>
          <p className="text-muted-foreground">
            Usuario: {user.fullName || user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Roles Actuales
            </CardTitle>
            <CardDescription>
              Roles actualmente asignados al usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userCurrentRoles.length > 0 ? (
              <div className="space-y-2">
                {userCurrentRoles.map((role: UserRole) => {
                  const roleStatus = getRoleStatus(role)
                  const isRoleActive = roleStatus === 'ACTIVE'

                  return (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <Badge variant={isRoleActive ? 'default' : 'secondary'}>
                        {isRoleActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No hay roles asignados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Asignar Roles
            </CardTitle>
            <CardDescription>
              Selecciona los roles que deseas asignar al usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableRoles.map((role: UserRole) => {
                const roleStatus = getRoleStatus(role)
                const isRoleActive = roleStatus === 'ACTIVE'
                const isCheckboxDisabled = !canUpdate || !isRoleActive

                return (
                  <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                      disabled={isCheckboxDisabled}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={role.id}
                        className={`block font-medium cursor-pointer ${!isRoleActive ? 'text-muted-foreground' : ''
                          }`}
                      >
                        {role.name}
                      </label>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <Badge variant={isRoleActive ? 'default' : 'secondary'}>
                      {isRoleActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {canUpdate && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {hasChanges() && (
                  <p className="text-sm text-muted-foreground">
                    Tienes cambios sin guardar
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveRoles}
                  disabled={!hasChanges() || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!canUpdate && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-center text-yellow-800">
              No tienes permisos para modificar los roles de este usuario
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
