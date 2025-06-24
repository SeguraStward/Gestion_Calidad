import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

import { AuthService } from '@/modules/auth/services/auth.service'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { CookieManager } from '../utils/cookie.manager'
import { useSessionStore } from '@/modules/auth/sessionStore'
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
  shouldShowError: boolean

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
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [shouldShowError, setShouldShowError] = useState(false)

  const router = useRouter()
  const { setRole } = useSessionStore()
  const { loading, error, execute: executeAsync } = useAsyncOperation<Role[]>()
  const { loading: submitting, execute: executeSubmit } = useAsyncOperation<void>()

  const resetError = useCallback(() => {
    setRetryCount(0)
    setShouldShowError(false)
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

    // Marcar el tiempo de inicio de carga
    setLoadingStartTime(Date.now())

    try {
      const result = await executeAsync(async () => {
        console.log('🔄 Cargando roles...')

        // Dar tiempo mínimo para que las cookies se establezcan
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userRoles = await AuthService.getUserRoles()
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

      // Calcular tiempo transcurrido
      const elapsedTime = loadingStartTime ? Date.now() - loadingStartTime : 0
      const minLoadingTime = 5000 // 5 segundos mínimo

      // Si no han pasado 5 segundos, esperar el tiempo restante
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime
        console.log(`⏰ Esperando ${remainingTime}ms adicionales para cumplir tiempo mínimo de carga...`)
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      // Manejar resultado exitoso
      if (result) {
        setRoles(result)
        setRetryCount(0)
        setLoadingStartTime(null)
        setShouldShowError(false)
        console.log('✅ Roles procesados exitosamente:', result)

        if (result.length === 1 && result[0]) {
          setSelectedRole(result[0])
        }
      }
    } catch (err) {
      // Calcular tiempo transcurrido antes de mostrar error
      const elapsedTime = loadingStartTime ? Date.now() - loadingStartTime : 0
      const minLoadingTime = 5000 // 5 segundos mínimo

      // Si no han pasado 5 segundos, esperar el tiempo restante antes de mostrar el error
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime
        console.log(`⏰ Error detectado, pero esperando ${remainingTime}ms adicionales antes de mostrar...`)
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      // Manejar error
      const errorMessage = getErrorMessage(err)
      setRetryCount((prev) => prev + 1)
      setLoadingStartTime(null)
      setShouldShowError(true)

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
  }, [executeAsync, getErrorMessage, router, loadingStartTime])

  const retryFetchRoles = useCallback(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleSubmit = useCallback(async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol.')
      return
    }

    await executeSubmit(async () => {
      console.log('🔄 Configurando rol activo via API:', selectedRole)

      try {
        // Mostrar transición
        setShowTransition(true)

        // PASO 1: Configurar rol activo en el backend (HttpOnly cookie)
        const success = await AuthService.setActiveRole(selectedRole.id)

        if (!success) {
          throw new Error('Failed to set active role on server')
        }

        // PASO 2: Actualizar el store de sesión
        setRole(selectedRole)

        // PASO 3: Guardar preferencia en sessionStorage (solo para UI)
        CookieManager.setActiveRole(selectedRole)

        console.log('✅ Rol configurado exitosamente:', {
          id: selectedRole.id,
          name: selectedRole.name,
          backendSet: success,
          sessionStored: true
        })

        toast.success(`Rol activo: ${selectedRole.name}`)

        // Pequeño delay para la UX
        await new Promise((resolve) => setTimeout(resolve, 1500))

        console.log('🔄 Preparando redirección a la página principal...')
        // La redirección será manejada por el componente de transición
      } catch (error) {
        console.error('❌ Error al configurar rol activo:', error)
        setShowTransition(false)
        throw new Error('Error al configurar el rol activo')
      }
    })
  }, [selectedRole, executeSubmit, setRole])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      router.push('/')
    }
  }, [canSkip, router])
  useEffect(() => {
    const initializeRoleSelection = async () => {
      // PASO 1: Verificar si hay rol activo via API (HttpOnly cookie)
      try {
        const activeRoleId = await AuthService.getActiveRole()
        const hasServerRole = activeRoleId !== null

        setHasActiveRole(hasServerRole)
        setCanSkip(hasServerRole)

        console.log('🔍 Estado inicial de rol activo:', {
          serverRoleId: activeRoleId,
          hasActiveRole: hasServerRole,
          canSkip: hasServerRole
        })
      } catch (error) {
        console.warn('Error checking active role:', error)
        setHasActiveRole(false)
        setCanSkip(false)
      }

      // PASO 2: Cargar roles si no están cargados
      if (roles.length === 0) {
        console.log('🚀 Cargando roles por primera vez...')
        fetchRoles()
      }
    }

    initializeRoleSelection()
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
    shouldShowError,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles,
    retryFetchRoles,
    resetError,
    onTransitionComplete
  }
}
