'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Badge } from '@una-gc/ui/components/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, Plus, X, Shield, Users, FileText, BarChart3, Trash2, Loader2 } from 'lucide-react'
import { useUserRole, useUpdateUserRole, useGetAllPermissions, useUserRoleWithPermissions } from '@/modules/user-management/user-role/service/user-role.service'
import { PermissionType, PermissionScope } from '@/modules/auth/types'
import type { UserRoleStatus, RolePermissionAssignment, SimpleUserPermission } from '@/modules/user-management/user-role/types/user-role.types'

const PERMISSION_TYPES = [
  { value: PermissionType.CREATE, label: 'Crear', icon: Plus, color: 'bg-green-100 text-green-800' },
  { value: PermissionType.READ, label: 'Leer', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: PermissionType.UPDATE, label: 'Actualizar', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  { value: PermissionType.DELETE, label: 'Eliminar', icon: Trash2, color: 'bg-red-100 text-red-800' },
  { value: PermissionType.REPORT, label: 'Reportes', icon: BarChart3, color: 'bg-purple-100 text-purple-800' }
]

const PERMISSION_SCOPES = [
  { value: PermissionScope.ALL, label: 'Todos los recursos' },
  { value: PermissionScope.OWN, label: 'Solo recursos propios' }
]

// Permission assignment interface for the role (extends the base type with display info)
interface PermissionAssignment extends RolePermissionAssignment {
  // Display info from backend permission
  name?: string
  code?: string
}

export default function EditUserRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string

  const { data: role, isLoading, error } = useUserRoleWithPermissions(roleId)
  const { mutate: updateRole, isPending } = useUpdateUserRole()
  const { data: availablePermissions, isLoading: permissionsLoading, error: permissionsError } = useGetAllPermissions()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as UserRoleStatus
  })

  const [assignedPermissions, setAssignedPermissions] = useState<PermissionAssignment[]>([])
  const [newPermissionAssignment, setNewPermissionAssignment] = useState({
    permissionID: '',
    permissions: [] as PermissionType[],
    scope: PermissionScope.ALL,
    actions: [] as string[]
  })
  const [customAction, setCustomAction] = useState('')
  const [isTogglingPermission, setIsTogglingPermission] = useState(false)

  // Debug permissions data safely in useEffect
  useEffect(() => {
    const roleData = role?.data || role
    console.log('🔍 Edit page - Permissions loading:', permissionsLoading)
    console.log('🔍 Edit page - Permissions data count:', availablePermissions?.length)
    console.log('🔍 Edit page - Role data:', roleData?.name, roleData?.id)
    console.log('🔍 Edit page - Permissions error:', permissionsError)
  }, [availablePermissions, permissionsLoading, permissionsError, role])

  // Initialize form data when role loads
  useEffect(() => {
    if (role) {
      // Extract actual role data from nested structure
      const roleData = role.data || role
      console.log('🔄 Initializing form data with role:', roleData.name)
      console.log('🔍 Full role object:', role)
      console.log('🔍 Extracted role data:', roleData)
      console.log('🔍 Role permissions count:', roleData.permissions?.length)
      console.log('🔍 Role permissions data:', roleData.permissions)

      setFormData({
        name: roleData.name,
        description: roleData.description || '',
        status: roleData.status || 'ACTIVE'
      })

      // Map enriched permissions to assignments
      const rolePermissions = roleData.permissions?.map((perm: any) => ({
        permissionID: perm.id, // Using 'id' from enriched permission
        permissions: perm.type || [], // Using 'type' from enriched permission
        scope: perm.scope,
        actions: perm.actions || [],
        name: perm.name, // Already available in enriched permission
        code: perm.code  // Already available in enriched permission
      })) || []

      console.log('🔄 Setting assigned permissions count:', rolePermissions.length)
      console.log('🔄 Mapped permissions:', rolePermissions)
      setAssignedPermissions(rolePermissions)
    }
  }, [role])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePermissionTypeToggle = useCallback((type: PermissionType) => {
    // Prevent multiple rapid clicks
    if (isTogglingPermission) return

    setIsTogglingPermission(true)
    setNewPermissionAssignment(prev => ({
      ...prev,
      permissions: prev.permissions.includes(type)
        ? prev.permissions.filter(t => t !== type)
        : [...prev.permissions, type]
    }))

    // Reset the debounce flag after a short delay
    setTimeout(() => setIsTogglingPermission(false), 100)
  }, [isTogglingPermission])

  const addCustomAction = useCallback(() => {
    console.log('🔧 ===== ADDCUSTOMACTION CALLED =====')
    console.log('🔧 Current customAction value:', `"${customAction}"`)
    console.log('🔧 Current actions array:', newPermissionAssignment.actions)

    const trimmedAction = customAction.trim()
    console.log('🔧 Trimmed action:', `"${trimmedAction}"`)

    if (!trimmedAction) {
      console.log('🔧 ❌ Action is empty, returning')
      return
    }

    if (newPermissionAssignment.actions.includes(trimmedAction)) {
      console.log('🔧 ❌ Action already exists, returning')
      return
    }

    console.log('🔧 ✅ Action is valid, updating state...')

    setNewPermissionAssignment(prev => {
      const newActions = [...prev.actions, trimmedAction]
      const updated = { ...prev, actions: newActions }
      console.log('🔧 📝 State update - Previous:', prev.actions)
      console.log('🔧 📝 State update - New:', newActions)
      console.log('🔧 📝 State update - Full object:', updated)
      return updated
    })

    setCustomAction('')
    console.log('🔧 📝 Cleared customAction input')
    console.log('🔧 ===== ADDCUSTOMACTION FINISHED =====')
  }, [customAction, newPermissionAssignment.actions])

  // Efecto para ver cambios en newPermissionAssignment
  useEffect(() => {
    console.log('🔧 🔄 newPermissionAssignment changed:', newPermissionAssignment)
  }, [newPermissionAssignment])

  const removeCustomAction = (action: string) => {
    setNewPermissionAssignment(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a !== action)
    }))
  }

  const addPermissionAssignment = () => {
    console.log('🔧 Adding permission assignment:', newPermissionAssignment)

    if (newPermissionAssignment.permissionID && newPermissionAssignment.permissions.length > 0) {
      const selectedPermission = availablePermissions?.find((p: SimpleUserPermission) => p.id === newPermissionAssignment.permissionID)

      const assignment: PermissionAssignment = {
        permissionID: newPermissionAssignment.permissionID,
        permissions: newPermissionAssignment.permissions,
        scope: newPermissionAssignment.scope,
        actions: newPermissionAssignment.actions,
        name: selectedPermission?.name,
        code: selectedPermission?.code
      }

      console.log('🔧 Final assignment to add:', assignment)
      console.log('🔧 Actions in assignment:', assignment.actions)

      setAssignedPermissions(prev => {
        const newAssignments = [...prev, assignment]
        console.log('🔧 All assignments after adding:', newAssignments)
        return newAssignments
      })

      setNewPermissionAssignment({
        permissionID: '',
        permissions: [],
        scope: PermissionScope.ALL,
        actions: []
      })
    }
  }

  const removePermissionAssignment = (permissionID: string) => {
    setAssignedPermissions(prev => prev.filter(p => p.permissionID !== permissionID))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre del rol es requerido')
      return
    }

    // Convert assignments to the format expected by backend
    const rolePermissions = assignedPermissions.map(assignment => {
      // Validate assignment data
      if (!assignment.permissionID || assignment.permissionID.trim() === '') {
        throw new Error('ID de permiso inválido')
      }

      if (!Array.isArray(assignment.permissions) || assignment.permissions.length === 0) {
        throw new Error('Tipos de permiso son requeridos')
      }

      return {
        permissionID: assignment.permissionID.trim(),
        permissions: assignment.permissions,
        scope: assignment.scope,
        actions: assignment.actions || []
      }
    })

    const updateData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      status: formData.status,
      permissions: rolePermissions
    }

    console.log('🚀 Updating role with data:', updateData)
    console.log('📋 Role permissions:', JSON.stringify(rolePermissions, null, 2))

    updateRole({ id: roleId, data: updateData as any }, {
      onSuccess: () => {
        console.log('✅ Role updated successfully')
        toast.success('Rol actualizado correctamente')
        router.push('/user-management/user-role')
      },
      onError: (error: any) => {
        console.error('❌ Error updating role:', error)
        toast.error(error?.message || 'Error al actualizar el rol')
      }
    })
  }

  if (isLoading || permissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando rol...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600">Error al cargar el rol</h2>
              <p className="text-muted-foreground mt-2">No se pudo cargar la información del rol</p>
              <Button
                onClick={() => router.push('/user-management/user-role')}
                className="mt-4"
              >
                Volver a Roles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || permissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold">Cargando datos del rol...</h2>
              <p className="text-muted-foreground mt-2">Por favor espera mientras cargamos la información</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600">Error al cargar el rol</h2>
              <p className="text-muted-foreground mt-2">No se pudo cargar la información del rol</p>
              <Button
                onClick={() => router.push('/user-management/user-role')}
                className="mt-4"
              >
                Volver a Roles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (permissionsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600">Error al cargar permisos</h2>
              <p className="text-muted-foreground mt-2">No se pudieron cargar los permisos del sistema</p>
              <Button
                onClick={() => router.push('/user-management/user-role')}
                className="mt-4"
              >
                Volver a Roles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/user-management/user-role')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Roles
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Rol</h1>
          <p className="text-muted-foreground">Modifica los permisos y configuración del rol</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Información general del rol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Rol *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Administrador, Editor, Supervisor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    if (value && (value === 'ACTIVE' || value === 'INACTIVE')) {
                      handleInputChange('status', value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe las responsabilidades y alcance de este rol"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assign New Permission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Agregar Nuevo Permiso
            </CardTitle>
            <CardDescription>
              Agrega permisos adicionales a este rol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permission">Permiso del Sistema</Label>
                <Select
                  value={newPermissionAssignment.permissionID}
                  onValueChange={(value) => setNewPermissionAssignment(prev => ({ ...prev, permissionID: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un permiso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(availablePermissions) && availablePermissions.filter((p: SimpleUserPermission) =>
                      !assignedPermissions.find(ap => ap.permissionID === p.id)
                    ).map((permission: SimpleUserPermission) => (
                      <SelectItem key={permission.id} value={permission.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{permission.name}</span>
                          <Badge variant="outline" className="text-xs">{permission.code}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                    {!Array.isArray(availablePermissions) && availablePermissions && (
                      <SelectItem value="" disabled>
                        Error: Los permisos no están en el formato correcto
                      </SelectItem>
                    )}
                    {!availablePermissions && (
                      <SelectItem value="" disabled>
                        Cargando permisos...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipos de Permiso</Label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_TYPES.map((permType) => {
                    const Icon = permType.icon
                    const isSelected = newPermissionAssignment.permissions.includes(permType.value)
                    return (
                      <div
                        key={permType.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${isSelected
                          ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-200'
                          } ${isTogglingPermission ? 'pointer-events-none opacity-50' : ''}`}
                        onClick={() => handlePermissionTypeToggle(permType.value)}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{permType.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Alcance del Permiso</Label>
                <Select
                  value={newPermissionAssignment.scope}
                  onValueChange={(value) => setNewPermissionAssignment(prev => ({ ...prev, scope: value as PermissionScope }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSION_SCOPES.map((scope) => (
                      <SelectItem key={scope.value} value={scope.value}>
                        {scope.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Acciones Personalizadas</Label>
                <div className="flex gap-2">
                  <Input
                    value={customAction}
                    onChange={(e) => {
                      console.log('🔧 Custom action input changed:', e.target.value)
                      setCustomAction(e.target.value)
                    }}
                    placeholder="Ej: approve, reject, export"
                    onKeyDown={(e) => {
                      console.log('🔧 Key pressed:', e.key, 'Value:', customAction)
                      if (e.key === 'Enter') {
                        console.log('🔧 Enter pressed! Preventing default and calling addCustomAction')
                        e.preventDefault()
                        e.stopPropagation()
                        addCustomAction()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      console.log('🔧 Plus button clicked! Event:', e)
                      e.preventDefault()
                      e.stopPropagation()
                      addCustomAction()
                    }}
                    variant="outline"
                    disabled={!customAction.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current actions: {JSON.stringify(newPermissionAssignment.actions)}
                </div>
                {newPermissionAssignment.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newPermissionAssignment.actions.map((action, index) => (
                      <Badge key={`new-action-${index}`} variant="secondary" className="flex items-center gap-1">
                        {action}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCustomAction(action)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={addPermissionAssignment}
                variant="outline"
                className="w-full"
                disabled={!newPermissionAssignment.permissionID || newPermissionAssignment.permissions.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Permiso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Permissions List */}
        {assignedPermissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Permisos Asignados ({assignedPermissions.length})</CardTitle>
              <CardDescription>
                Lista de permisos que tiene este rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedPermissions.map((assignment, index) => (
                  <div key={`permission-${assignment.permissionID}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.name}</span>
                        <Badge variant="outline">{assignment.code}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Tipos:</span>
                        <div className="flex gap-1">
                          {assignment.permissions.map((type, typeIndex) => {
                            const permType = PERMISSION_TYPES.find(pt => pt.value === type)
                            return (
                              <Badge key={`type-${type}-${typeIndex}`} className={permType?.color}>
                                {permType?.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Alcance:</span>
                        <Badge variant="secondary">
                          {PERMISSION_SCOPES.find(s => s.value === assignment.scope)?.label}
                        </Badge>
                      </div>
                      {assignment.actions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Acciones:</span>
                          <div className="flex gap-1">
                            {assignment.actions.map((action, actionIndex) => (
                              <Badge key={`action-${action}-${actionIndex}`} variant="outline">{action}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePermissionAssignment(assignment.permissionID)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/user-management/user-role')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? 'Actualizando...' : 'Actualizar Rol'}
          </Button>
        </div>
      </form>
    </div>
  )
}
