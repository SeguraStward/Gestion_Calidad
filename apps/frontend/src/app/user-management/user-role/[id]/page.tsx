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
import { useUserRole, useUpdateUserRole, useGetAllPermissions } from '@/modules/user-management/user-role/service/user-role.service'
import { PermissionType, PermissionScope } from '@/modules/auth/types'
import type { UserRoleStatus } from '@/modules/user-management/user-role/types/user-role.types'

const PERMISSION_TYPES = [
  { value: PermissionType.CREATE, label: 'Crear', icon: Plus, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: PermissionType.READ, label: 'Leer', icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  { value: PermissionType.UPDATE, label: 'Actualizar', icon: Shield, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  { value: PermissionType.DELETE, label: 'Eliminar', icon: Trash2, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  { value: PermissionType.REPORT, label: 'Reportes', icon: BarChart3, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' }
]

const PERMISSION_SCOPES = [
  { value: PermissionScope.ALL, label: 'Todos los recursos' },
  { value: PermissionScope.OWN, label: 'Solo recursos propios' }
]

interface PermissionAssignment {
  permissionID: string
  permissions: PermissionType[]
  scope: PermissionScope
  actions: string[]
  name?: string
  code?: string
}

export default function EditUserRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string

  const { data: role, isLoading, error } = useUserRole(roleId)
  const { mutate: updateRole, isPending } = useUpdateUserRole()
  const { data: availablePermissions, isLoading: permissionsLoading } = useGetAllPermissions()

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when role loads
  useEffect(() => {
    if (role && availablePermissions) {
      setFormData({
        name: role.name,
        description: role.description || '',
        status: role.status || 'ACTIVE'
      })

      const rolePermissions = role.permissions?.map((perm: any) => {
        const permissionDetails = availablePermissions.find((ap: any) => ap.id === perm.permissionID)
        return {
          permissionID: perm.permissionID,
          permissions: perm.permissions || [],
          scope: perm.scope,
          actions: perm.actions || [],
          name: permissionDetails?.name || '',
          code: permissionDetails?.code || ''
        }
      }) || []

      setAssignedPermissions(rolePermissions)
    }
  }, [role, availablePermissions])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePermissionTypeToggle = useCallback((type: PermissionType) => {
    setNewPermissionAssignment(prev => ({
      ...prev,
      permissions: prev.permissions.includes(type)
        ? prev.permissions.filter(t => t !== type)
        : [...prev.permissions, type]
    }))
  }, [])

  const addCustomAction = useCallback(() => {
    if (customAction.trim() && !newPermissionAssignment.actions.includes(customAction.trim())) {
      setNewPermissionAssignment(prev => ({
        ...prev,
        actions: [...prev.actions, customAction.trim()]
      }))
      setCustomAction('')
    }
  }, [customAction, newPermissionAssignment.actions])

  const removeCustomAction = useCallback((action: string) => {
    setNewPermissionAssignment(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a !== action)
    }))
  }, [])

  const addPermissionAssignment = useCallback(() => {
    if (newPermissionAssignment.permissionID && newPermissionAssignment.permissions.length > 0) {
      const selectedPermission = availablePermissions?.find((p: any) => p.id === newPermissionAssignment.permissionID)

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
  }, [newPermissionAssignment, availablePermissions])

  const removePermissionAssignment = useCallback((permissionID: string) => {
    setAssignedPermissions(prev => prev.filter(p => p.permissionID !== permissionID))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!formData.name.trim()) {
      toast.error('El nombre del rol es requerido')
      return
    }

    setIsSubmitting(true)

    try {
      const rolePermissions = assignedPermissions.map(assignment => ({
        permissionID: assignment.permissionID,
        permissions: assignment.permissions,
        scope: assignment.scope,
        actions: assignment.actions
      }))

      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        permissions: rolePermissions
      }

      updateRole({ id: roleId, data: updateData }, {
        onSuccess: () => {
          toast.success('Rol actualizado correctamente')
          router.push('/user-management/user-role')
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Error al actualizar el rol')
        },
        onSettled: () => {
          setIsSubmitting(false)
        }
      })
    } catch (error) {
      setIsSubmitting(false)
      toast.error('Error inesperado al actualizar el rol')
    }
  }, [formData, assignedPermissions, roleId, updateRole, router, isSubmitting])

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
                    {availablePermissions?.filter((p: any) =>
                      !assignedPermissions.find(ap => ap.permissionID === p.id)
                    ).map((permission: any) => (
                      <SelectItem key={permission.id} value={permission.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{permission.name}</span>
                          <Badge variant="outline" className="text-xs">{permission.code}</Badge>
                        </div>
                      </SelectItem>
                    ))}
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
                          ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
                          : 'bg-background border-border hover:bg-accent hover:text-accent-foreground'
                          }`}
                        onClick={() => handlePermissionTypeToggle(permType.value)}
                      >
                        <Checkbox checked={isSelected} onChange={() => { }} />
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
                      <Badge key={`action-${index}`} variant="secondary" className="flex items-center gap-1">
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
            disabled={isPending || isSubmitting}
            className="flex items-center gap-2"
          >
            {(isPending || isSubmitting) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {(isPending || isSubmitting) ? 'Actualizando...' : 'Actualizar Rol'}
          </Button>
        </div>
      </form>
    </div>
  )
}
