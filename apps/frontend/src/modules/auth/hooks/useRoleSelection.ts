import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

import { AuthService } from '@/modules/auth/auth.service'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { CookieManager } from '@/utils'
import { useSessionStore } from '@/store/sessionStore'
import { Role } from '../types'

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
  showTransition: boolean

  // Actions
  setSelectedRole: (role: Role | null) => void
  handleSubmit: () => Promise<void>
  handleSkip: () => void
  fetchRoles: () => Promise<void>
  retryFetchRoles: () => void
  resetError: () => void
  onTransitionComplete: () => void
}

const MAX_RETRY_ATTEMPTS = 4

export function useRoleSelection(): UseRoleSelectionReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [canSkip, setCanSkip] = useState(false)
  const [hasActiveRole, setHasActiveRole] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showTransition, setShowTransition] = useState(false)

  const router = useRouter()
  const { setRole } = useSessionStore()
  const { loading, error, execute: executeAsync } = useAsyncOperation<Role[]>()
  const { loading: submitting, execute: executeSubmit } = useAsyncOperation<void>()

  const resetError = useCallback(() => {
    setRetryCount(0)
  }, [])

  const onTransitionComplete = useCallback(() => {
    setShowTransition(false)
  }, [])

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
    console.log('🏁 Iniciando carga de roles (petición única)...')

    try {
      const result = await executeAsync(async () => {
        console.log('🔄 Cargando roles...')

        // Dar tiempo mínimo para que las cookies se establezcan
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userRoles = await AuthService.getUserActiveRoles()
        console.log('✅ Roles cargados exitosamente:', userRoles)

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
      })

      // Manejar resultado exitoso
      if (result) {
        setRoles(result)
        setRetryCount(0)
        console.log('✅ Roles procesados exitosamente:', result)

        if (result.length === 1 && result[0]) {
          setSelectedRole(result[0])
        }
      }
    } catch (err) {
      // Manejar error
      const errorMessage = getErrorMessage(err)
      setRetryCount((prev) => prev + 1)

      console.error('❌ Error al cargar roles:', errorMessage)

      if (
        errorMessage.includes('Token expirado') ||
        errorMessage.includes('sesión ha expirado') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      ) {
        toast.error('Sesión expirada. Redirigiendo al login...')
        router.push('/auth/login')
        return
      }

      toast.error(`Error: ${errorMessage}`)
    }
  }, [executeAsync, getErrorMessage, router])

  const retryFetchRoles = useCallback(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleSubmit = useCallback(async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol.')
      return
    }

    await executeSubmit(async () => {
      console.log('🔄 Seleccionando rol localmente (sin API):', selectedRole)

      try {
        // Mostrar transición
        setShowTransition(true)

        // Solo guardar el rol localmente sin comunicarse con la API
        // Actualizar el store con el rol seleccionado
        setRole(selectedRole)

        // Guardar el rol en cookies y localStorage
        CookieManager.setActiveRole(selectedRole)

        console.log('✅ Rol guardado exitosamente:', {
          id: selectedRole.id,
          name: selectedRole.name,
          cookieSet: CookieManager.hasActiveRole()
        })

        toast.success(`Rol seleccionado: ${selectedRole.name}`)

        // Delay para asegurar que la cookie se guarde completamente
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Verificar que la cookie se guardó correctamente
        const cookieCheck = CookieManager.hasActiveRole()
        console.log('🔍 Verificación de cookie después de guardar:', cookieCheck)

        if (!cookieCheck) {
          throw new Error('Error al verificar la cookie del rol')
        }

        console.log('🔄 Preparando redirección a la página principal...')
        // La redirección será manejada por el componente de transición
      } catch (error) {
        console.error('❌ Error al guardar el rol:', error)
        setShowTransition(false)
        throw new Error('Error al guardar la selección de rol')
      }
    })
  }, [selectedRole, executeSubmit, setRole])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      router.push('/')
    }
  }, [canSkip, router])
  useEffect(() => {
    const hasRole = CookieManager.hasActiveRole()
    setHasActiveRole(hasRole)
    setCanSkip(hasRole)

    // Solo cargar roles si no hay roles ya cargados
    if (roles.length === 0) {
      console.log('🚀 Cargando roles por primera vez...')
      fetchRoles()
    }
  }, [fetchRoles, roles.length])

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
    showTransition,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles,
    retryFetchRoles,
    resetError,
    onTransitionComplete
  }
}
