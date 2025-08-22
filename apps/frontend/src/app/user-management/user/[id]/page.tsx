'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Users, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Separator } from '@una-gc/ui/components/separator'
import { Badge } from '@una-gc/ui/components/badge'
import { Skeleton } from '@una-gc/ui/components/skeleton'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { UpdateUserDto, UserStatus } from '@/modules/user-management/user/types/user.types'
import { useUser, useUpdateUserProfile, useGetUserRoles, useUpdateUserRoles } from '@/modules/user-management/user/service/user.service'
import { useUserRoles } from '@/modules/user-management/user-role/service/user-role.service'
import { UserRole } from '@/modules/user-management/user-role/types/user-role.types'

/**
 * Edit User Page
 * Allows editing user information and managing roles
 */
function EditUserContent() {
  const router = useRouter()
  const params = useParams()
  const { hasPermission } = useAuth()

  const userId = params.id as string

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    fullLastName: '',
    photoUrl: '',
    status: 'ACTIVE' as UserStatus
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [initialRoles, setInitialRoles] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check permissions
  const canUpdate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.UPDATE, SCOPES.ALL)

  // Get user data
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useUser(userId)

  // Get all available roles
  const { data: rolesData, isLoading: rolesLoading } = useUserRoles({ limit: 1000 })

  // Get user's current roles
  const { data: userRolesData, isLoading: userRolesLoading, refetch: refetchUserRoles } = useGetUserRoles(userId)

  // Update user profile mutation
  const updateUserMutation = useUpdateUserProfile()

  // Update user roles mutation
  const updateUserRolesMutation = useUpdateUserRoles()

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      // Validate and normalize status
      const validStatuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'PRE_REGISTRATION']
      let userStatus: UserStatus = 'ACTIVE' // default

      if (user.status && validStatuses.includes(user.status as UserStatus)) {
        userStatus = user.status as UserStatus
      } else {
        console.warn('🚨 Invalid or missing user status:', user.status, 'Using ACTIVE as default')
      }

      setFormData({
        email: user.email || '',
        fullName: user.fullName || '',
        fullLastName: user.fullLastName || '',
        photoUrl: user.photoUrl || '',
        status: userStatus
      })
    }
  }, [user])

  // Load user roles when available
  useEffect(() => {
    if (userRolesData?.data) {
      // Handle both debug format and normal format
      let currentRoleIds: string[] = []

      if (userRolesData.data.userRoles && Array.isArray(userRolesData.data.userRoles)) {
        // Debug format: { user, activeRoleId, cookies, userRoles }
        currentRoleIds = userRolesData.data.userRoles.map((role: UserRole) => role.id)
      } else if (Array.isArray(userRolesData.data)) {
        // Normal format: { data: [...] }
        currentRoleIds = userRolesData.data.map((role: UserRole) => role.id)
      } else if (Array.isArray(userRolesData)) {
        // Direct array format
        currentRoleIds = userRolesData.map((role: UserRole) => role.id)
      }

      setSelectedRoles(currentRoleIds)
      setInitialRoles(currentRoleIds)
    }
  }, [userRolesData])

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    // Special handling for status field to ensure valid values
    if (field === 'status') {
      const validStatuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'PRE_REGISTRATION']
      if (!validStatuses.includes(value as UserStatus)) {
        console.warn('Invalid status value:', value, 'Using ACTIVE as default')
        value = 'ACTIVE'
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId]

    setSelectedRoles(newSelectedRoles)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email debe ser válido'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio'
    }

    if (formData.photoUrl && formData.photoUrl.trim() && !/^https?:\/\/.+/.test(formData.photoUrl)) {
      newErrors.photoUrl = 'La URL debe ser válida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if there are unsaved changes
  const hasChanges = () => {
    if (!user) return false

    const formChanged =
      formData.email !== (user.email || '') ||
      formData.fullName !== (user.fullName || '') ||
      formData.fullLastName !== (user.fullLastName || '') ||
      formData.photoUrl !== (user.photoUrl || '') ||
      formData.status !== (user.status || 'ACTIVE')

    const rolesChanged = JSON.stringify([...selectedRoles].sort()) !== JSON.stringify([...initialRoles].sort())

    return formChanged || rolesChanged
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!hasChanges()) {
      toast.info('No hay cambios para guardar')
      return
    }

    setIsSubmitting(true)
    try {
      // Create clean update data with only the fields we want to update
      const updateData: Record<string, any> = {}

      // Only include fields that have valid values
      if (formData.email?.trim()) {
        updateData.email = formData.email.trim()
      }

      if (formData.fullName?.trim()) {
        updateData.fullName = formData.fullName.trim()
      }

      if (formData.fullLastName?.trim()) {
        updateData.fullLastName = formData.fullLastName.trim()
      }

      if (formData.photoUrl?.trim()) {
        updateData.photoUrl = formData.photoUrl.trim()
      }

      // Only include status if it's a valid enum value
      if (formData.status && ['ACTIVE', 'INACTIVE', 'PRE_REGISTRATION'].includes(formData.status)) {
        updateData.status = formData.status
      }

      console.log('🔍 Form data before processing:', formData)
      console.log('🔍 Final update data to send:', JSON.stringify(updateData, null, 2))
      console.log('🔍 Status value:', formData.status, 'Type:', typeof formData.status)

      await updateUserMutation.mutateAsync({
        userId,
        updateData
      })

      // Update user roles if they changed
      const rolesChanged = JSON.stringify([...selectedRoles].sort()) !== JSON.stringify([...initialRoles].sort())
      if (rolesChanged) {
        await updateUserRolesMutation.mutateAsync({
          userId,
          roleIds: selectedRoles
        })
      }

      // Refresh data
      await Promise.all([
        refetchUser(),
        refetchUserRoles()
      ])

      toast.success('Usuario actualizado exitosamente')

      // Update initial roles to new state
      setInitialRoles([...selectedRoles])

    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    if (hasChanges()) {
      const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Estás seguro que quieres salir?')
      if (!confirmLeave) return
    }
    router.back()
  }

  // Early returns for loading and permissions
  if (userLoading || rolesLoading || userRolesLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Usuario no encontrado</h3>
            <p className="text-muted-foreground">El usuario que intentas editar no existe</p>
            <Button onClick={handleBack} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canUpdate) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground">No tienes permisos para editar usuarios</p>
            <Button onClick={handleBack} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableRoles = rolesData?.data || []
  const activeRoles = availableRoles.filter(role => role.status === 'ACTIVE')

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
          <p className="text-muted-foreground">
            Editando: {user.fullName} ({user.email})
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main User Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza la información básica del usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Juan Carlos"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Full Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullLastName">Apellidos</Label>
                  <Input
                    id="fullLastName"
                    placeholder="Pérez García"
                    value={formData.fullLastName}
                    onChange={(e) => handleInputChange('fullLastName', e.target.value)}
                  />
                </div>

                {/* Photo URL */}
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL de Foto de Perfil</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.photoUrl}
                    onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                    className={errors.photoUrl ? 'border-red-500' : ''}
                  />
                  {errors.photoUrl && (
                    <p className="text-sm text-red-500">{errors.photoUrl}</p>
                  )}
                  {formData.photoUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.photoUrl}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-full object-cover border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Estado del Usuario</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: UserStatus) => {
                      // Only call handleInputChange if we have a valid, non-empty value
                      if (value && value.trim()) {
                        handleInputChange('status', value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRE_REGISTRATION">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Pre-Registro</Badge>
                          <span className="text-sm text-muted-foreground">
                            Usuario debe completar registro
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Activo</Badge>
                          <span className="text-sm text-muted-foreground">
                            Usuario puede acceder al sistema
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Inactivo</Badge>
                          <span className="text-sm text-muted-foreground">
                            Usuario sin acceso al sistema
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles Assignment */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Roles
                </CardTitle>
                <CardDescription>
                  Actualiza los roles asignados al usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay roles disponibles
                    </p>
                  ) : (
                    activeRoles.map((role: UserRole) => (
                      <div key={role.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={role.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">
                              {role.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {role.permissions?.length || 0} permisos
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedRoles.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Roles Asignados:</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoles.map((roleId) => {
                          const role = activeRoles.find(r => r.id === roleId)
                          return role ? (
                            <Badge key={roleId} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Changes indicator */}
                {hasChanges() && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2 text-orange-600">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">Cambios pendientes</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

/**
 * Protected route wrapper for edit user page
 */
export default function EditUserPage() {
  return (
    <ProtectedRoute
      requirePermissions={[{
        resource: USER_MANAGEMENT_PERMISSIONS.USER,
        action: ACTIONS.UPDATE,
        scope: SCOPES.ALL
      }]}
      fallbackPath="/dashboard"
    >
      <EditUserContent />
    </ProtectedRoute>
  )
}
