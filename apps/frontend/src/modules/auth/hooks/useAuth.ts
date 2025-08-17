import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AuthService } from '../services'
import { CookieDetectionService } from '../services/cookie-detection.service'
import { useSessionStore } from '../sessionStore'
import { Role, UserBasicInfo, PermissionType } from '../types' // ← Añadir PermissionType

export interface UseAuthReturn {
  setAuthTokens(authToken: string, refreshToken: string): unknown
  checkAuthStatus(): unknown
  activeRole: any
  fullyAuthenticated: any
  user: UserBasicInfo | null
  role: Role | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: () => void
  logout: () => Promise<void>
  setActiveRole: (roleId: string) => Promise<boolean>
  refreshAuth: () => Promise<void>
  fetchUserRoles: () => Promise<Role | null>
  //adding has permissions
  hasPermission: (resource: string, action: string, scope?: string) => boolean;

}

/**
 * Unified Authentication Hook
 * Provides centralized auth state management and operations
 * Uses HttpOnly cookie detection and session storage for user data
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false) // Add flag to prevent multiple refreshAuth calls

  const router = useRouter()
  //  'setRole' is declared but its value is never read.ts(6133)
  const { user, role, setUser, clearSession, isAuthenticated: hasStoredUser } = useSessionStore() //

  /**
   * Check if user is authenticated via API (validates HttpOnly cookies)
   */
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      return await CookieDetectionService.isAuthenticated()
    } catch {
      return false
    }
  }, [])

  /**
   * Fetch user roles separately to avoid infinite loops
   */
  const fetchUserRoles = useCallback(async () => {
    try {
      console.log('[useAuth] Fetching user roles...')
      const userRoles = await AuthService.getUserRoles()
      console.log('[useAuth] User roles received:', userRoles)

      if (userRoles && userRoles.length > 0) {
        const { setRole } = useSessionStore.getState()
        const firstRole = userRoles[0]
        if (firstRole) {
          console.log('[useAuth] Setting first role as active:', firstRole)
          setRole(firstRole)
          return firstRole
        } else {
          console.warn('[useAuth] First role is undefined')
          setRole(null)
          return null
        }
      } else {
        console.warn('[useAuth] No roles found for user')
        const { setRole } = useSessionStore.getState()
        setRole(null)
        return null
      }
    } catch (roleError) {
      console.error('[useAuth] Error fetching user roles:', roleError)
      const { setRole } = useSessionStore.getState()
      setRole(null)
      return null
    }
  }, []) // Sin dependencias para mantener la función estable

  /**
   * Refresh authentication state from API
   */
  const refreshAuth = useCallback(async () => {
    // Prevent multiple simultaneous refreshAuth calls
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    setIsLoading(true)
    setError(null)

    try {
      const apiAuthStatus = await checkAuthentication()

      if (!apiAuthStatus) {
        // No valid cookies - clear session
        clearSession()
        return
      }

      // Get fresh user data if authenticated but no stored user
      if (!hasStoredUser()) {
        const UserBasicInfo = await AuthService.getUserBasicInfo()
        setUser(UserBasicInfo)
        // Los roles se obtendrán en el useEffect separado
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication check failed'
      setError(errorMessage)
      clearSession()
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [checkAuthentication, hasStoredUser, setUser, clearSession]) // Removed isRefreshing from dependencies

  /**
   * Initiate Google OAuth login
   */
  const login = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    window.location.href = `${apiUrl}/auth/google/login`
  }, [])

  /**
   * Logout user and clear all session data
   */
  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      // Call backend logout to clear HttpOnly cookies
      await AuthService.logout()
    } catch (error) {
      console.warn('Backend logout failed:', error)
    } finally {
      // Always clear local session regardless of API response
      clearSession()
      setIsLoading(false)

      // Redirect to login
      router.push('/auth/login')
      toast.success('Sesión cerrada correctamente')
    }
  }, [clearSession, router])

  /**
   * Set active role for current user
   */
  const setActiveRole = useCallback(
    async (roleId: string): Promise<boolean> => {
      try {
        const success = await AuthService.setActiveRole(roleId)

        if (success) {
          // Refresh user data to get updated role info
          await refreshAuth()
          toast.success('Rol activo actualizado')
        }

        return success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set active role'
        setError(errorMessage)
        toast.error('Error al cambiar el rol activo')
        return false
      }
    },
    [refreshAuth]
  )

  /**
 * Checks if the user has a specific permission
 * @param resource - The resource or permission code to check (matches backend permission.code)
 * @param action - The action type (CREATE, READ, UPDATE, DELETE, REPORT)
 * @param scope - The permission scope (ALL or OWN)
 * @returns boolean indicating if the user has the requested permission
 */
  const hasPermission = useCallback(
    (resource: string, action: string, scope: string = 'ALL'): boolean => {
      try {
        // Obtener el rol actual del store directamente para evitar dependencias
        const currentRole = useSessionStore.getState().role;

        // Si no hay rol o permisos, denegar acceso
        if (!currentRole || !Array.isArray(currentRole.permissions)) {
          return false;
        }

        // Buscar el permiso por código
        const permission = currentRole.permissions.find(p => {
          if (!p) return false;
          return p.code === resource;
        });

        // Si no encontramos el permiso, denegar acceso
        if (!permission) {
          return false;
        }

        // Si el permiso está inactivo, denegar acceso
        if (permission.status !== 'ACTIVE') {
          return false;
        }

        // Verificar si el action está en el array de actions del permiso
        if (Array.isArray(permission.actions) && permission.actions.includes(action)) {
          return true;
        }

        // IMPORTANTE: Para el rol ADMINISTRADOR, asumir todas las acciones permitidas
        if (currentRole.name === 'ADMINISTRADOR') {
          return true;
        }

        return false;
      } catch (error) {
        console.error(`💥 Error en hasPermission para ${resource}.${action}:`, error);
        return false;
      }
    },
    []
  );

  // Initialize auth state on mount
  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  // Separate effect to fetch roles if user exists but has no role
  useEffect(() => {
    const initializeRoles = async () => {
      // Solo intentar obtener roles si:
      // 1. No estamos cargando
      // 2. Hay un usuario
      // 3. No hay rol actual
      // 4. No hay error
      if (!isLoading && user && !role && !error) {
        console.log('[useAuth] User exists but no role, attempting to fetch roles...')

        try {
          console.log('[useAuth] Fetching user roles...')
          const userRoles = await AuthService.getUserRoles()
          console.log('[useAuth] User roles received:', userRoles)

          if (userRoles && userRoles.length > 0) {
            const { setRole } = useSessionStore.getState()
            const firstRole = userRoles[0]
            if (firstRole) {
              console.log('[useAuth] Setting first role as active:', firstRole)
              setRole(firstRole)
            } else {
              console.warn('[useAuth] First role is undefined')
              setRole(null)
            }
          } else {
            console.warn('[useAuth] No roles found for user')
            const { setRole } = useSessionStore.getState()
            setRole(null)
          }
        } catch (roleError) {
          console.error('[useAuth] Error fetching user roles:', roleError)
          const { setRole } = useSessionStore.getState()
          setRole(null)
        }
      }
    }

    // Delay para evitar que se ejecute inmediatamente después del refreshAuth
    const timeoutId = setTimeout(initializeRoles, 500)

    return () => clearTimeout(timeoutId)
  }, [user, role, isLoading, error])

  // Placeholder implementations for missing properties
  const setAuthTokens = (_authToken: string, _refreshToken: string) => {
    // todo Esta logica solo se maneja en el backend, no es necesario en el frontend
    return undefined
  }

  const checkAuthStatus = () => {
    // Implement status check logic if needed
    // For now, just a placeholder
    return undefined
  }

  const activeRole = role // or derive from user if needed
  const fullyAuthenticated = !!user // or implement more robust logic

  return {
    setAuthTokens,
    checkAuthStatus,
    activeRole,
    fullyAuthenticated,
    user,
    role,
    isLoading,
    isAuthenticated: !!hasStoredUser(),
    error,
    login,
    logout,
    setActiveRole,
    refreshAuth,
    hasPermission,
    fetchUserRoles
  }
}
