'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, RefreshCcw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Cookies from 'js-cookie'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Label } from '@una-gc/ui/components/label'

import { cn } from '@una-gc/ui/lib/utils'
import { Role, AuthService } from '@/modules/auth/auth.service'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

export default function SelectRolePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canCancel, setCanCancel] = useState(false)
  const router = useRouter()

  // Verificar si hay un rol activo al cargar el componente
  useEffect(() => {
    const activeRoleId = Cookies.get('active_role_id')
    setCanCancel(!activeRoleId)
  }, [])

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      switch (axiosError.response?.status) {
        case 401:
          return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
        case 403:
          return 'No tienes permisos para acceder a esta funcionalidad.'
        case 404:
          return 'No se encontraron roles disponibles para tu usuario.'
        case 500:
          return 'Error interno del servidor. Intenta más tarde.'
        case 503:
          return 'El servicio no está disponible temporalmente.'
        default:
          return (
            (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data
              ? (axiosError.response.data as { message?: string }).message
              : undefined) || 'Error de conexión. Verifica tu internet.'
          )
      }
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Ha ocurrido un error inesperado.'
  }

  const fetchRoles = useCallback(async () => {
    console.log('🏁 Starting to fetch user roles...')
    try {
      setLoading(true)
      setError(null)

      const userRoles = await AuthService.getUserActiveRoles()
      console.log('📊 User roles received:', userRoles)

      if (!Array.isArray(userRoles)) {
        throw new Error('Formato de respuesta inválido del servidor.')
      }

      if (userRoles.length === 0) {
        setError('No tienes roles asignados. Contacta al administrador.')
        setRoles([])
        return
      }

      setRoles(userRoles)

      // Auto-seleccionar si solo hay un rol disponible
      if (userRoles.length === 1 && userRoles[0]) {
        setSelectedRole(userRoles[0])
      }
    } catch (error) {
      console.error('❌ Error fetching roles:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleCancel = () => {
    router.back()
  }

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log('🔄 Starting role switch for role:', selectedRole)
      const response = await AuthService.changeRole(selectedRole.id)
      console.log('✅ Role switch successful, response:', response)

      if (!response) {
        throw new Error('No se pudo cambiar el rol. Intenta nuevamente.')
      }

      // Guardar información del rol para uso local
      const roleData = {
        id: selectedRole.id,
        name: selectedRole.name,
        permissions: selectedRole.permissions || []
      }

      localStorage.setItem('selected_role', JSON.stringify(roleData))

      toast.success(`Rol cambiado exitosamente a: ${selectedRole.name}`)
      router.push('/profile')
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      toast.error(errorMessage)

      // Si es error 401, redirigir al login
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Selecciona tu rol</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="space-y-4 text-center">
              <div className="py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron roles disponibles.</p>
              </div>

              <Button onClick={fetchRoles} variant="outline" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Intentar nuevamente
              </Button>
            </div>
          ) : (
            <RadioGroup
              value={selectedRole?.id.toString()}
              onValueChange={(value) => {
                const role = roles.find((r) => r.id.toString() === value)
                if (role) setSelectedRole(role)
              }}
              className="space-y-3"
            >
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    'flex items-center space-x-3 rounded-md border p-4 transition-colors cursor-pointer hover:bg-accent/50',
                    selectedRole?.id === role.id ? 'border-primary bg-accent' : 'border-input'
                  )}
                  onClick={() => setSelectedRole(role)}
                >
                  <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                  <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{role.name}</div>
                    {role.description && <div className="text-sm text-muted-foreground mt-1">{role.description}</div>}
                  </Label>
                  {selectedRole?.id === role.id && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {canCancel && (
            <Button onClick={handleCancel} variant="outline" disabled={submitting} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || submitting || loading || !!error}
            className={cn('transition-all', canCancel ? 'flex-1' : 'w-full')}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
