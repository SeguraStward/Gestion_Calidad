'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save, Plus, X, Shield, Users, FileText, BarChart3, Trash2, Loader2 } from 'lucide-react'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Badge } from '@una-gc/ui/components/badge'
import { useCreateUserRole, useGetAllPermissions } from '@/modules/user-management/user-role/service/user-role.service'
import { Status, PermissionType, PermissionScope } from '@/modules/auth/types'
import type { CreateUserRoleDto, UserRoleStatus, SimpleUserPermission, RolePermissionAssignment } from '@/modules/user-management/user-role/types/user-role.types'

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

export default function CreateUserRolePage() {
  const router = useRouter()
  const { mutate: createRole, isPending } = useCreateUserRole()
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
    console.log('🔍 Permissions loading:', permissionsLoading)
    console.log('🔍 Permissions data:', availablePermissions)
    console.log('🔍 Is permissions array?', Array.isArray(availablePermissions))
    console.log('🔍 Permissions error:', permissionsError)
  }, [availablePermissions, permissionsLoading, permissionsError])

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

  const addCustomAction = () => {
    if (customAction.trim() && !newPermissionAssignment.actions.includes(customAction.trim())) {
      setNewPermissionAssignment(prev => ({
        ...prev,
        actions: [...prev.actions, customAction.trim()]
      }))
      setCustomAction('')
    }
  }

  const removeCustomAction = (action: string) => {
    setNewPermissionAssignment(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a !== action)
    }))
  }

  const addPermissionAssignment = () => {
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

      setAssignedPermissions(prev => [...prev, assignment])
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

    const createData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      status: formData.status,
      permissions: rolePermissions
    }

    console.log('🚀 Creating role with data:', createData)
    console.log('📋 Role permissions:', JSON.stringify(rolePermissions, null, 2))

    createRole(createData, {
      onSuccess: () => {
        console.log('✅ Role created successfully')
        toast.success('Rol creado correctamente')
        router.push('/user-management/user-role')
      },
      onError: (error: any) => {
        console.error('❌ Error creating role:', error)
        toast.error(error?.message || 'Error al crear el rol')
      }
    })
  }

  if (permissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando permisos...</span>
        </div>
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
              <p className="text-gray-600 mt-2">No se pudieron cargar los permisos del sistema</p>
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
          <h1 className="text-2xl font-bold">Crear Nuevo Rol</h1>
          <p className="text-gray-600">Define un nuevo rol con permisos específicos del sistema</p>
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
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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

        {/* Assign Permission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Asignar Permisos
            </CardTitle>
            <CardDescription>
              Selecciona permisos del sistema y configura su alcance
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
                    onChange={(e) => setCustomAction(e.target.value)}
                    placeholder="Ej: approve, reject, export"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAction())}
                  />
                  <Button type="button" onClick={addCustomAction} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newPermissionAssignment.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newPermissionAssignment.actions.map((action, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
                Asignar Permiso
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
                Lista de permisos que tendrá este rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedPermissions.map((assignment) => (
                  <div key={assignment.permissionID} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.name}</span>
                        <Badge variant="outline">{assignment.code}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Tipos:</span>
                        <div className="flex gap-1">
                          {assignment.permissions.map((type) => {
                            const permType = PERMISSION_TYPES.find(pt => pt.value === type)
                            return (
                              <Badge key={type} className={permType?.color}>
                                {permType?.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Alcance:</span>
                        <Badge variant="secondary">
                          {PERMISSION_SCOPES.find(s => s.value === assignment.scope)?.label}
                        </Badge>
                      </div>
                      {assignment.actions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Acciones:</span>
                          <div className="flex gap-1">
                            {assignment.actions.map((action, index) => (
                              <Badge key={index} variant="outline">{action}</Badge>
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
                      className="text-red-600 hover:text-red-700"
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
          <Button type="submit" disabled={isPending} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isPending ? 'Creando...' : 'Crear Rol'}
          </Button>
        </div>
      </form>
    </div>
  )
}
