import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { useSessionStore, UserActiveRole } from '@/store/sessionStore'
import { CookieManager } from '@/utils/cookie.manager'
import { AuthService } from '../auth.service'
import { Role } from '../types'
import { useHttpOnlyAuth } from './useHttpOnlyAuth'

interface AuthState {
  isAuthenticated: boolean
  activeRole: UserActiveRole | null
  roles: Role[]
  isLoading: boolean
  error: string | null
  retryCount: number
}

export interface UseAuthReturn extends AuthState {
  logout: () => void
  clearRole: () => void
  refreshRole: () => void
  loadUserRoles: () => Promise<void>
  retryLoadRoles: () => void
  resetError: () => void
  canRetry: boolean
  // HTTP-only auth methods
  hasAuthToken: boolean
  hasRefreshToken: boolean
  tokenLoading: boolean
  tokenError: string | null
  checkAuthStatus: () => Promise<boolean>
  setAuthTokens: (authToken: string, refreshToken: string) => Promise<boolean>
  fullyAuthenticated: boolean
}

const MAX_RETRY_ATTEMPTS = 3

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const { user, role, setUser, setRole, clearSession } = useSessionStore()
  const {
    isAuthenticated: httpOnlyAuthenticated,
    hasAuthToken,
    hasRefreshToken,
    loading: tokenLoading,
    error: tokenError,
    setAuthTokens,
    logout: httpOnlyLogout,
    checkAuthStatus
  } = useHttpOnlyAuth()

  const [state, setState] = useState<
    Omit<AuthState, 'activeRole' | 'isAuthenticated'> & {
      activeRole: UserActiveRole | null
      isAuthenticated: boolean
    }
  >({
    isAuthenticated: !!role,
    activeRole: role,
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
    if (state.isLoading) return
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
        clearSession()
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
  }, [state.isLoading, handleError, clearSession])
  const logout = useCallback(async () => {
    try {
      // Usar el logout del servicio que maneja todo
      await AuthService.logout()

      // También limpiar cookies HTTP-only
      await httpOnlyLogout()
    } catch (error) {
      console.warn('Error during logout, but continuing with local cleanup:', error)
    } finally {
      // Limpiar estado local siempre
      CookieManager.clearAllAuthData()
      clearSession()
      setState({
        isAuthenticated: false,
        activeRole: null,
        roles: [],
        isLoading: false,
        error: null,
        retryCount: 0
      })
      window.location.href = '/auth/login'
    }
  }, [clearSession, httpOnlyLogout])

  const clearRole = useCallback(() => {
    CookieManager.removeActiveRole()
    setRole(undefined as unknown as UserActiveRole)
    setState((prev) => ({
      ...prev,
      activeRole: null,
      error: null
    }))
  }, [setRole])

  const refreshRole = useCallback(() => {
    const currentRole = useSessionStore.getState().role
    if (currentRole) {
      CookieManager.setActiveRole(currentRole)
    }
    setState((prev) => ({
      ...prev,
      activeRole: currentRole,
      isAuthenticated: !!currentRole
    }))
  }, [])

  const retryLoadRoles = useCallback(() => {
    loadUserRoles()
  }, [loadUserRoles])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState((prev) => ({
          ...prev,
          activeRole: role,
          isAuthenticated: !!role,
          isLoading: false
        }))
        if (role) {
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
  }, [role, loadUserRoles])
  return {
    ...state,
    logout,
    clearRole,
    refreshRole,
    loadUserRoles,
    retryLoadRoles,
    resetError,
    canRetry: state.retryCount < MAX_RETRY_ATTEMPTS,
    // HTTP-only auth properties
    hasAuthToken,
    hasRefreshToken,
    tokenLoading,
    tokenError,
    checkAuthStatus,
    setAuthTokens,
    fullyAuthenticated: httpOnlyAuthenticated && !!state.activeRole
  }
}
