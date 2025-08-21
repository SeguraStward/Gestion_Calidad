'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Separator } from '@una-gc/ui/components/separator'
import { Badge } from '@una-gc/ui/components/badge'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { CreateUserDto, UserStatus } from '@/modules/user-management/user/types/user.types'
import { useCreateUser } from '@/modules/user-management/user/service/user.service'
import { useUserRoles } from '@/modules/user-management/user-role/service/user-role.service'
import { UserRole } from '@/modules/user-management/user-role/types/user-role.types'

/**
 * Create User Page
 * Allows creating a new user with roles assignment
 */
function CreateUserContent() {
  const router = useRouter()
  const { hasPermission } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    fullLastName: '',
    photoUrl: '',
    status: 'PRE_REGISTRATION' as UserStatus
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check permissions
  const canCreate = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.CREATE, SCOPES.ALL)

  // Get all available roles
  const { data: rolesData, isLoading: rolesLoading } = useUserRoles({ limit: 1000 })

  // Create user mutation
  const createUserMutation = useCreateUser()

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId]

    setSelectedRoles(newSelectedRoles)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const createData: CreateUserDto = {
        ...formData,
        roleIds: selectedRoles,
        photoUrl: formData.photoUrl || undefined
      }

      await createUserMutation.mutateAsync(createData)

      toast.success('Usuario creado exitosamente')
      router.push('/user-management/user')
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }  // Handle back navigation
  const handleBack = () => {
    router.back()
  }

  if (!canCreate) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground">No tienes permisos para crear usuarios</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
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
                  Información básica del nuevo usuario
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
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Estado del Usuario</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: UserStatus) => handleInputChange('status', value)}
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
                  Asignación de Roles
                </CardTitle>
                <CardDescription>
                  Selecciona los roles para el usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
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
                )}

                {selectedRoles.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Roles Seleccionados:</Label>
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
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
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
 * Protected route wrapper for create user page
 */
export default function CreateUserPage() {
  return (
    <ProtectedRoute
      requirePermissions={[{
        resource: USER_MANAGEMENT_PERMISSIONS.USER,
        action: ACTIONS.CREATE,
        scope: SCOPES.ALL
      }]}
      fallbackPath="/dashboard"
    >
      <CreateUserContent />
    </ProtectedRoute>
  )
}
