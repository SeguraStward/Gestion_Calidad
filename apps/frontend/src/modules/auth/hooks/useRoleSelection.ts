import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

import { AuthService } from '@/modules/auth/auth.service'
import { CookieManager } from '@/utils/cookie-manager'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { Role } from '../interfaces'

export interface UseRoleSelectionReturn {
  // State
  roles: Role[]
  selectedRole: Role | null
  loading: boolean
  submitting: boolean
  error: string | null
  canSkip: boolean
  hasActiveRole: boolean

  // Actions
  setSelectedRole: (role: Role | null) => void
  handleSubmit: () => Promise<void>
  handleSkip: () => void
  fetchRoles: () => Promise<void>
}

export function useRoleSelection(): UseRoleSelectionReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [canSkip, setCanSkip] = useState(false)
  const [hasActiveRole, setHasActiveRole] = useState(false)

  const router = useRouter()
  const { loading, error, execute: executeAsync } = useAsyncOperation<Role[]>()
  const { loading: submitting, execute: executeSubmit } = useAsyncOperation<void>()

  const getErrorMessage = useCallback((error: unknown): string => {
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
  }, [])

  const fetchRoles = useCallback(async () => {
    console.log('🏁 Starting to fetch user roles...')

    const result = await executeAsync(async () => {
      const userRoles = await AuthService.getUserActiveRoles()
      console.log('📊 User roles received:', userRoles)

      if (!Array.isArray(userRoles)) {
        throw new Error('Formato de respuesta inválido del servidor.')
      }

      if (userRoles.length === 0) {
        throw new Error('No tienes roles asignados. Contacta al administrador.')
      }

      return userRoles
    })

    if (result) {
      setRoles(result)

      // Auto-seleccionar si solo hay un rol disponible
      if (result.length === 1 && result[0]) {
        setSelectedRole(result[0])
      }
    }

    if (error) {
      toast.error(error)
    }
  }, [executeAsync, error])

  const handleSubmit = useCallback(async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol.')
      return
    }

    await executeSubmit(async () => {
      console.log('🔄 Setting active role locally:', selectedRole)

      CookieManager.setActiveRole(selectedRole)

      const roleData = {
        id: selectedRole.id,
        name: selectedRole.name,
        permissions: selectedRole.permissions || []
      }
      localStorage.setItem('selected_role', JSON.stringify(roleData))

      toast.success(`Rol seleccionado exitosamente: ${selectedRole.name}`)
      router.push('/')
    })
  }, [selectedRole, executeSubmit, router])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      router.push('/')
    }
  }, [canSkip, router])

  // Verificar si hay un rol activo al cargar el componente
  useEffect(() => {
    const hasRole = CookieManager.hasActiveRole()
    setHasActiveRole(hasRole)
    setCanSkip(hasRole) // Solo puede omitir si ya tiene un rol seleccionado
  }, [])

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return {
    roles,
    selectedRole,
    loading,
    submitting,
    error,
    canSkip,
    hasActiveRole,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles
  }
}
