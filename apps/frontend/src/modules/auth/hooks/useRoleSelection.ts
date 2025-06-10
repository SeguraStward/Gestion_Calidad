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
  retryCount: number
  canRetry: boolean

  // Actions
  setSelectedRole: (role: Role | null) => void
  handleSubmit: () => Promise<void>
  handleSkip: () => void
  fetchRoles: () => Promise<void>
  retryFetchRoles: () => void
  resetError: () => void
}

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000

export function useRoleSelection(): UseRoleSelectionReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [canSkip, setCanSkip] = useState(false)
  const [hasActiveRole, setHasActiveRole] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [hasInitialized, setHasInitialized] = useState(false)

  const router = useRouter()
  const { loading, error, execute: executeAsync } = useAsyncOperation<Role[]>()
  const { loading: submitting, execute: executeSubmit } = useAsyncOperation<void>()

  const resetError = useCallback(() => {
    setRetryCount(0)
  }, [])

  const processRolesData = useCallback((userRoles: any[]): Role[] => {
    if (!Array.isArray(userRoles)) {
      throw new Error('Formato de respuesta inválido del servidor.')
    }

    if (userRoles.length === 0) {
      throw new Error('No tienes roles asignados. Contacta al administrador.')
    }

    return userRoles.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      permissions: role.permissions ?? []
    }))
  }, [])

  const handleAuthError = useCallback(
    (errorMessage: string) => {
      if (
        errorMessage.includes('Token expirado') ||
        errorMessage.includes('sesión ha expirado') ||
        errorMessage.includes('401')
      ) {
        toast.error(errorMessage)
        router.push('/auth/login')
        return true
      }
      return false
    },
    [router]
  )

  const handleRolesSuccess = useCallback((rolesData: Role[]) => {
    setRoles(rolesData)
    setRetryCount(0)

    // Auto-seleccionar si solo hay un rol disponible
    if (rolesData.length === 1 && rolesData[0]) {
      setSelectedRole(rolesData[0])
    }
  }, [])

  const handleRolesError = useCallback(
    (errorMessage: string) => {
      setRetryCount((prev) => prev + 1)

      // Verificar si es un error de autenticación
      if (!handleAuthError(errorMessage)) {
        // Para todos los demás errores, solo mostrar el mensaje
        toast.error(errorMessage)
      }
    },
    [handleAuthError]
  )

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
          return 'Error interno del servidor. Si el problema persiste, contacta soporte.'
        case 502:
        case 503:
        case 504:
          return 'El servicio no está disponible temporalmente. Intenta más tarde.'
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
    console.log('🏁 Manual fetch user roles...')

    try {
      const result = await executeAsync(async () => {
        const userRoles = await AuthService.getUserActiveRoles()
        console.log('📊 User roles received:', userRoles)
        return processRolesData(userRoles)
      })

      if (result) {
        handleRolesSuccess(result)
      }
    } catch (err) {
      console.error('Error in fetchRoles:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      handleRolesError(errorMessage)
    }
  }, [executeAsync, processRolesData, handleRolesSuccess, handleRolesError])

  const retryFetchRoles = useCallback(() => {
    // Reintento manual únicamente
    fetchRoles()
  }, [fetchRoles])

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
    setCanSkip(hasRole)
  }, [])

  // Cargar roles al montar el componente (solo una vez)
  useEffect(() => {
    if (hasInitialized) return

    let mounted = true
    setHasInitialized(true)

    const loadRoles = async () => {
      try {
        console.log('🏁 Starting to fetch user roles...')

        const result = await executeAsync(async () => {
          const userRoles = await AuthService.getUserActiveRoles()
          console.log('📊 User roles received:', userRoles)
          return processRolesData(userRoles)
        })

        if (mounted && result) {
          handleRolesSuccess(result)
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading roles:', err)
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
          handleRolesError(errorMessage)
        }
      }
    }

    loadRoles()

    return () => {
      mounted = false
    }
  }, [hasInitialized])

  // Manejo de errores del hook useAsyncOperation por separado
  useEffect(() => {
    if (error && hasInitialized) {
      handleRolesError(error)
    }
  }, [error, hasInitialized, handleRolesError])

  return {
    roles,
    selectedRole,
    loading,
    submitting,
    error,
    canSkip,
    hasActiveRole,
    retryCount,
    canRetry: retryCount < MAX_RETRY_ATTEMPTS,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles,
    retryFetchRoles,
    resetError
  }
}
