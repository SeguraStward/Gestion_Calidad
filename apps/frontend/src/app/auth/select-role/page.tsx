'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, RefreshCcw } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@una-gc/ui/components/collapsible'
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
  const [debugInfo, setDebugInfo] = useState<string>('')
  const router = useRouter()

  function handleApiError(error: any) {
    if (typeof error === 'object' && error !== null && 'response' in error && error.response) {
      setDebugInfo(
        JSON.stringify(
          {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          },
          null,
          2
        )
      )
    } else {
      setDebugInfo(JSON.stringify(error, null, 2))
    }
  }

  const fetchRoles = useCallback(async () => {
    console.log('🏁 Starting to fetch user roles...')
    try {
      setLoading(true)
      const userRoles = await AuthService.getUserActiveRoles()
      console.log('📊 User roles received:', userRoles)

      if (Array.isArray(userRoles)) {
        setRoles(userRoles)

        // Auto-select if only one role is available
        if (userRoles.length === 1 && userRoles[0]) {
          setSelectedRole(userRoles[0])
        }
      } else {
        console.error('❌ Invalid response format for roles:', userRoles)
        setRoles([])
        toast.error('Formato de respuesta inválido. Contacta al soporte.')
      }
    } catch (error) {
      console.error('❌ Error fetching roles:', error)
      handleApiError(error)
      toast.error('No se pudieron cargar tus roles. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, []) // Sin dependencias ya que no usa variables externas

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleSubmit = async () => {
    if (!selectedRole) return

    try {
      setSubmitting(true)
      console.log('🔄 Starting role switch for role:', selectedRole)
      const response = await AuthService.changeRole(selectedRole.id)
      console.log('✅ Role switch successful, response:', response)

      if (!response) {
        throw new Error('Role switch was unsuccessful')
      }

      // Solo guardamos la información del rol para uso local
      const roleData = {
        id: selectedRole.id,
        name: selectedRole.name,
        permissions: selectedRole.permissions || []
      }

      localStorage.setItem('selected_role', JSON.stringify(roleData))

      toast.success(`Rol cambiado a: ${selectedRole.name}`)
      router.push('/profile')
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        handleApiError(axiosError)

        if (axiosError.response?.status === 401) {
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
        } else if (axiosError.response?.status === 403) {
          toast.error('No tienes permiso para usar este rol.')
        } else {
          toast.error('Error al seleccionar rol. Intenta de nuevo.')
        }
      } else {
        handleApiError(error)
        toast.error('Error inesperado. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Selecciona tu rol</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ) : roles.length === 0 ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>No tienes roles asignados o hubo un problema al cargar tus roles.</AlertDescription>
            </Alert>

            <Button onClick={fetchRoles} variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>

            {debugInfo && (
              <Collapsible className="border rounded-md">
                <CollapsibleTrigger className="w-full p-3 text-sm font-medium text-left text-yellow-800 bg-yellow-50 hover:bg-yellow-100 rounded-md">
                  Información de depuración
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-yellow-50 rounded-md">
                  <pre className="text-xs overflow-auto bg-white p-2 rounded border border-yellow-200 max-h-60">
                    {debugInfo || 'Sin información adicional'}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={selectedRole?.id.toString()}
              onValueChange={(value) => {
                const role = roles.find((r) => r.id.toString() === value)
                if (role) setSelectedRole(role)
              }}
            >
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    'flex items-center space-x-2 rounded-md border p-3',
                    selectedRole?.id === role.id ? 'border-primary bg-accent' : 'border-input'
                  )}
                >
                  <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                  <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{role.name}</div>
                    {role.description && <div className="text-xs text-muted-foreground mt-1">{role.description}</div>}
                  </Label>
                  {selectedRole?.id === role.id && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </RadioGroup>

            <Collapsible className="border rounded-md">
              <CollapsibleTrigger className="w-full p-2 text-sm font-medium text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md">
                Mostrar información de depuración
              </CollapsibleTrigger>
              <CollapsibleContent className="p-2 bg-gray-50 rounded-md">
                <pre className="text-xs overflow-auto bg-white p-2 rounded border border-gray-200 max-h-60">
                  {JSON.stringify({ roles, selectedRole }, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleSubmit} disabled={!selectedRole || submitting || loading} className="w-full">
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
  )
}
