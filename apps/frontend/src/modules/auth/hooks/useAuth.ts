import { useState, useEffect, useCallback } from 'react'
import { CookieManager } from '@/utils/cookie-manager'
import { AuthService } from '../auth.service'
import { Role } from '../interfaces'

interface AuthState {
  isAuthenticated: boolean
  activeRole: ReturnType<typeof CookieManager.getActiveRole>
  roles: Role[]
  isLoading: boolean
  error: string | null
  retryCount: number
}

export interface UseAuthReturn extends AuthState {
  // Actions
  logout: () => void
  clearRole: () => void
  refreshRole: () => void
  loadUserRoles: () => Promise<void>
  retryLoadRoles: () => void
  resetError: () => void
  canRetry: boolean
}

const MAX_RETRY_ATTEMPTS = 3

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    activeRole: null,
    roles: [],
    isLoading: true,
    error: null,
    retryCount: 0
  })

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, retryCount: 0 }))
  }, [])

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Auth Error in ${operation}:`, error)

    const errorMessage = error?.response?.data?.message || error?.message || `Error en ${operation}`

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
      retryCount: prev.retryCount + 1
    }))
  }, [])

  const loadUserRoles = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (state.isLoading) {
      return
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const userRolesResponse = await AuthService.getUserActiveRoles()

      if (!userRolesResponse || userRolesResponse.length === 0) {
        setState((prev) => ({
          ...prev,
          roles: [],
          isLoading: false,
          error: 'No se encontraron roles disponibles para el usuario'
        }))
        return
      }

      // Map UserRolesResponse[] to Role[]
      const roles: Role[] = userRolesResponse.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions
      }))

      setState((prev) => ({
        ...prev,
        roles,
        isLoading: false,
        error: null,
        retryCount: 0
      }))
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          activeRole: null,
          roles: [],
          isLoading: false,
          error: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        }))
        return
      }

      handleError(error, 'cargar roles')
    }
  }, [state.isLoading, handleError])

  const logout = useCallback(() => {
    CookieManager.removeActiveRole()
    localStorage.removeItem('selected_role')
    setState({
      isAuthenticated: false,
      activeRole: null,
      roles: [],
      isLoading: false,
      error: null,
      retryCount: 0
    })
    window.location.href = '/auth/login'
  }, [])

  const clearRole = useCallback(() => {
    CookieManager.removeActiveRole()
    localStorage.removeItem('selected_role')
    setState((prev) => ({
      ...prev,
      activeRole: null,
      error: null
    }))
  }, [])

  const refreshRole = useCallback(() => {
    CookieManager.refreshActiveRole()
    const activeRole = CookieManager.getActiveRole()
    setState((prev) => ({
      ...prev,
      activeRole,
      isAuthenticated: !!activeRole
    }))
  }, [])

  const retryLoadRoles = useCallback(() => {
    loadUserRoles()
  }, [loadUserRoles])

  // Inicialización
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const activeRole = CookieManager.getActiveRole()

        setState((prev) => ({
          ...prev,
          activeRole,
          isAuthenticated: !!activeRole,
          isLoading: false
        }))

        // Solo cargar roles si hay una sesión activa
        if (activeRole) {
          await loadUserRoles()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false
        }))
      }
    }

    initializeAuth()
  }, [loadUserRoles])

  return {
    ...state,
    logout,
    clearRole,
    refreshRole,
    loadUserRoles,
    retryLoadRoles,
    resetError,
    canRetry: state.retryCount < MAX_RETRY_ATTEMPTS
  }
}
