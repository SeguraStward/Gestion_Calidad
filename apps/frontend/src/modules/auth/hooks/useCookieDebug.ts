import { useEffect, useState, useCallback } from 'react'
import { CookieManager } from '@/utils/cookie.manager'

interface CookieDebugInfo {
  hasAuthToken: boolean
  hasRefreshToken: boolean
  hasActiveRole: boolean
  acclsctiveRoleId: string | null
  cookieCount: number
  lastCheck: Date
}

/**
 * Hook para debug de cookies - solo para desarrollo
 * Ayuda a identificar problemas con las cookies de autenticación
 * Centralizado en modules/auth/hooks/
 */
export function useCookieDebug() {
  const [debugInfo, setDebugInfo] = useState<CookieDebugInfo>({
    hasAuthToken: false,
    hasRefreshToken: false,
    hasActiveRole: false,
    acclsctiveRoleId: null,
    cookieCount: 0,
    lastCheck: new Date()
  })

  const checkCookies = useCallback(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return debugInfo
    }

    try {
      const info: CookieDebugInfo = {
        hasAuthToken: !!CookieManager.getCookie('auth_token'),
        hasRefreshToken: !!CookieManager.getCookie('refresh_token'),
        hasActiveRole: CookieManager.hasActiveRole(),
        acclsctiveRoleId: CookieManager.getActiveRoleId(),
        cookieCount: document.cookie.split(';').length,
        lastCheck: new Date()
      }

      setDebugInfo(info)
      return info
    } catch (error) {
      console.error('Error checking cookies:', error)
      return debugInfo
    }
  }, [debugInfo])

  const logCookieState = () => {
    if (process.env.NODE_ENV !== 'development') {
      return debugInfo
    }

    const info = checkCookies()
    console.log('🍪 Cookie Debug Info:', info)
    console.log('🍪 Raw cookies:', document.cookie)
    return info
  }

  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    // Check inicial
    checkCookies()

    // Check periódico cada 10 segundos
    const interval = setInterval(checkCookies, 10000)
    return () => clearInterval(interval)
  }, [checkCookies])

  return {
    debugInfo,
    checkCookies,
    logCookieState
  }
}

export default useCookieDebug
