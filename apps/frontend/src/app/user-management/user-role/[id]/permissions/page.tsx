'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Search, Shield, Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Badge } from '@una-gc/ui/components/badge'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Label } from '@una-gc/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@una-gc/ui/components/select'
import { Skeleton } from '@una-gc/ui/components/skeleton'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'
import {
  useUserRoleWithPermissions,
  useGetAllPermissions,
  useUpdateRolePermissions
} from '@/modules/user-management/user-role/service/user-role.service'
import type { RolePermissionAssignment } from '@/modules/user-management/user-role/types/user-role.types'

interface PermissionWithAssignment {
  id: string
  name: string
  code: string
  status: string
  isAssigned: boolean
  currentActions: string[]
  currentScope: string
}

/**
 * Page for managing role permissions
 * Allows adding/removing permissions and configuring actions and scope
 */
export default function RolePermissionsPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  const { hasPermission } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [permissionStates, setPermissionStates] = useState<Record<string, PermissionWithAssignment>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const canUpdate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_ROLE, ACTIONS.UPDATE, SCOPES.ALL)

  // Fetch role with permissions
  const { data: roleData, isLoading: isLoadingRole } = useUserRoleWithPermissions(roleId)

  // Fetch all available permissions
  const { data: allPermissions = [], isLoading: isLoadingPermissions } = useGetAllPermissions()

  // Update mutation
  const { mutate: updatePermissions, isPending: isSaving } = useUpdateRolePermissions()

  // Initialize permission states when data loads
  useEffect(() => {
    if (roleData && allPermissions.length > 0) {
      console.log('📋 Loading role permissions:', {
        roleName: roleData.name,
        assignedPermissionsCount: roleData.permissions?.length || 0,
        totalPermissionsCount: allPermissions.length
      })

      const states: Record<string, PermissionWithAssignment> = {}

      allPermissions.forEach(permission => {
        // Find if this permission is assigned to the role
        const assignedPermission = roleData.permissions?.find(
          (p: any) => p.permissionID === permission.id || p.id === permission.id
        )

        // Get actions from either 'permissions' or 'actions' field
        const actions = assignedPermission?.permissions || assignedPermission?.actions || []

        if (assignedPermission) {
          console.log(`✅ Permission ${permission.name}: actions=${JSON.stringify(actions)}, scope=${assignedPermission.scope}`)
        }

        states[permission.id] = {
          id: permission.id,
          name: permission.name,
          code: permission.code || '',
          status: permission.status,
          isAssigned: !!assignedPermission,
          currentActions: actions,
          currentScope: assignedPermission?.scope || 'OWN'
        }
      })

      console.log(`📊 Total assigned permissions: ${Object.values(states).filter(p => p.isAssigned).length}`)
      setPermissionStates(states)
    }
  }, [roleData, allPermissions])

  // Available actions
  const availableActions = ['CREATE', 'READ', 'UPDATE', 'DELETE']
  const availableScopes = ['ALL', 'OWN']

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    return Object.values(permissionStates).filter(permission =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [permissionStates, searchQuery])

  // Separate assigned and unassigned permissions
  const assignedPermissions = filteredPermissions.filter(p => p.isAssigned)
  const unassignedPermissions = filteredPermissions.filter(p => !p.isAssigned)

  /**
   * Toggle permission assignment
   */
  const handleTogglePermission = (permissionId: string) => {
    setPermissionStates(prev => {
      const permission = prev[permissionId]
      if (!permission) return prev

      return {
        ...prev,
        [permissionId]: {
          ...permission,
          isAssigned: !permission.isAssigned,
          currentActions: !permission.isAssigned ? ['READ'] : [],
          currentScope: 'OWN'
        }
      }
    })
    setHasChanges(true)
  }

  /**
   * Toggle action for a permission
   */
  const handleToggleAction = (permissionId: string, action: string) => {
    setPermissionStates(prev => {
      const permission = prev[permissionId]
      if (!permission) return prev

      const actions = permission.currentActions.includes(action)
        ? permission.currentActions.filter(a => a !== action)
        : [...permission.currentActions, action]

      return {
        ...prev,
        [permissionId]: {
          ...permission,
          currentActions: actions
        }
      }
    })
    setHasChanges(true)
  }

  /**
   * Change scope for a permission
   */
  const handleScopeChange = (permissionId: string, scope: string) => {
    setPermissionStates(prev => {
      const permission = prev[permissionId]
      if (!permission) return prev

      return {
        ...prev,
        [permissionId]: {
          ...permission,
          currentScope: scope
        }
      }
    })
    setHasChanges(true)
  }

  /**
   * Save permission changes
   */
  const handleSave = () => {
    if (!canUpdate) {
      toast.error('No tienes permisos para actualizar este rol')
      return
    }

    console.log('🔍 Current permission states BEFORE filtering:')
    Object.values(permissionStates).forEach(p => {
      if (p.isAssigned) {
        console.log(`  - ${p.name}: isAssigned=${p.isAssigned}, actions=${JSON.stringify(p.currentActions)}, scope=${p.currentScope}`)
      }
    })

    // Build permissions payload - only include assigned permissions with actions
    const permissions = Object.values(permissionStates)
      .filter(p => p.isAssigned && p.currentActions.length > 0)
      .map(p => ({
        permissionID: p.id,
        permissions: p.currentActions, // Backend expects 'permissions' field
        scope: p.currentScope,
        actions: p.currentActions // Keep the same as permissions for compatibility
      }))

    console.log('💾 Saving permissions:', { roleId, permissions, count: permissions.length })
    console.log('📦 Full payload:', JSON.stringify(permissions, null, 2))

    updatePermissions(
      { roleId, permissions },
      {
        onSuccess: (data) => {
          console.log('✅ Permissions saved successfully!')
          console.log('📥 Server response:', data)
          toast.success('Permisos actualizados correctamente')
          setHasChanges(false)

          // Force refetch role data to see what was actually saved
          setTimeout(() => {
            console.log('🔄 Refetching role data...')
            window.location.reload()
          }, 1000)
        },
        onError: (error: any) => {
          console.error('❌ Error updating permissions:', error)
          toast.error(`Error al actualizar permisos: ${error.message || 'Error desconocido'}`)
        }
      }
    )
  }

  /**
   * Render permission card
   */
  const renderPermissionCard = (permission: PermissionWithAssignment) => {
    return (
      <Card key={permission.id} className={permission.isAssigned ? 'border-primary' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={permission.isAssigned}
                onCheckedChange={() => handleTogglePermission(permission.id)}
                disabled={!canUpdate}
              />
              <div>
                <CardTitle className="text-base">{permission.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{permission.code}</code>
                </CardDescription>
              </div>
            </div>
            <Badge variant={permission.isAssigned ? 'default' : 'secondary'}>
              {permission.isAssigned ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              {permission.isAssigned ? 'Asignado' : 'No asignado'}
            </Badge>
          </div>
        </CardHeader>

        {permission.isAssigned && (
          <CardContent className="pt-0 space-y-4">
            {/* Actions */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Acciones permitidas</Label>
              <div className="flex flex-wrap gap-2">
                {availableActions.map(action => (
                  <div key={action} className="flex items-center">
                    <Checkbox
                      id={`${permission.id}-${action}`}
                      checked={permission.currentActions.includes(action)}
                      onCheckedChange={() => handleToggleAction(permission.id, action)}
                      disabled={!canUpdate}
                    />
                    <Label
                      htmlFor={`${permission.id}-${action}`}
                      className="ml-2 text-sm font-normal cursor-pointer"
                    >
                      {action}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Alcance (Scope)</Label>
              <Select
                value={permission.currentScope}
                onValueChange={(value) => handleScopeChange(permission.id, value)}
                disabled={!canUpdate}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableScopes.map(scope => (
                    <SelectItem key={scope} value={scope}>
                      {scope === 'ALL' ? 'Todos (ALL)' : 'Propios (OWN)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {permission.currentScope === 'ALL'
                  ? 'Puede gestionar todos los recursos'
                  : 'Solo puede gestionar sus propios recursos'}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (isLoadingRole || isLoadingPermissions) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!roleData) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No se encontró el rol</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestionar Permisos</h1>
            <p className="text-muted-foreground mt-1">
              Rol: <span className="font-semibold">{roleData.name}</span>
            </p>
          </div>
        </div>

        {canUpdate && (
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar permisos por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Permisos</CardDescription>
            <CardTitle className="text-3xl">{allPermissions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Permisos Asignados</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {Object.values(permissionStates).filter(p => p.isAssigned).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sin Asignar</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {Object.values(permissionStates).filter(p => !p.isAssigned).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Assigned Permissions */}
      {assignedPermissions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Permisos Asignados</h2>
            <Badge>{assignedPermissions.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {assignedPermissions.map(renderPermissionCard)}
          </div>
        </div>
      )}

      {/* Unassigned Permissions */}
      {unassignedPermissions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Permisos Disponibles</h2>
            <Badge variant="secondary">{unassignedPermissions.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {unassignedPermissions.map(renderPermissionCard)}
          </div>
        </div>
      )}

      {/* No results */}
      {filteredPermissions.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No se encontraron permisos que coincidan con tu búsqueda
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="border-yellow-500 shadow-lg">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="text-sm">
                <p className="font-semibold">Tienes cambios sin guardar</p>
                <p className="text-muted-foreground text-xs">
                  Haz clic en "Guardar Cambios" para aplicar los cambios
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
