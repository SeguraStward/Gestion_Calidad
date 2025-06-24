import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AuthService } from '../services'
import { CookieDetectionService } from '../services/cookie-detection.service'
import { useSessionStore } from '../sessionStore'
import { Role, UserBasicInfo } from '../types'

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
}

/**
 * Unified Authentication Hook
 * Provides centralized auth state management and operations
 * Uses HttpOnly cookie detection and session storage for user data
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
   * Refresh authentication state from API
   */
  const refreshAuth = useCallback(async () => {
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
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication check failed'
      setError(errorMessage)
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [checkAuthentication, hasStoredUser, setUser, clearSession])

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

  // Initialize auth state on mount
  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

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
    isAuthenticated: hasStoredUser(),
    error,
    login,
    logout,
    setActiveRole,
    refreshAuth
  }
}
