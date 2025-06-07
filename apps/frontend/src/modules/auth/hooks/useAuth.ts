import { useCallback } from 'react'
import { CookieManager } from '@/utils/cookie-manager'

export interface UseAuthReturn {
  // State
  isAuthenticated: boolean
  activeRole: ReturnType<typeof CookieManager.getActiveRole>

  // Actions
  logout: () => void
  clearRole: () => void
  refreshRole: () => void
}

export function useAuth(): UseAuthReturn {
  const activeRole = CookieManager.getActiveRole()
  const isAuthenticated = !!activeRole

  const logout = useCallback(() => {
    CookieManager.removeActiveRole()
    // Limpiar localStorage también
    localStorage.removeItem('selected_role')
    // Redireccionar al login
    window.location.href = '/auth/login'
  }, [])

  const clearRole = useCallback(() => {
    CookieManager.removeActiveRole()
    localStorage.removeItem('selected_role')
  }, [])

  const refreshRole = useCallback(() => {
    CookieManager.refreshActiveRole()
  }, [])

  return {
    isAuthenticated,
    activeRole,
    logout,
    clearRole,
    refreshRole
  }
}
