import { useEffect, useState, useCallback } from 'react'
import { CookieManager } from '@/modules/auth/utils/cookie.manager'
import { CookieDetectionService } from '../services/cookie-detection.service'

interface CookieDebugInfo {
  hasAuthToken: boolean
  hasRefreshToken: boolean
  hasActiveRole: boolean
  activeRoleId: string | null
  sessionRoleId: string | null
  cookieCount: number
  lastCheck: Date
  apiAuthStatus: boolean
}

/**
 * Hook para debug de cookies - solo para desarrollo
 * Ayuda a identificar problemas con las cookies de autenticación
 * Usa detección API para HttpOnly cookies y sessionStorage para preferencias
 */
export function useCookieDebug() {
  const [debugInfo, setDebugInfo] = useState<CookieDebugInfo>({
    hasAuthToken: false,
    hasRefreshToken: false,
    hasActiveRole: false,
    activeRoleId: null,
    sessionRoleId: null,
    cookieCount: 0,
    lastCheck: new Date(),
    apiAuthStatus: false
  })

  const checkCookies = useCallback(async () => {
    if (typeof window === 'undefined' || process.env.NODE_ENV != 'development') {
      return debugInfo
    }

    try {
      // Check HttpOnly cookies via API
      const cookiePresence = await CookieDetectionService.checkCookiePresence()

      // Check sessionStorage preferences
      const sessionRoleId = CookieManager.getRoleId()

      const info: CookieDebugInfo = {
        hasAuthToken: cookiePresence.hasAuthToken,
        hasRefreshToken: cookiePresence.hasRefreshToken,
        hasActiveRole: cookiePresence.hasActiveRole,
        activeRoleId: null, // API doesn't expose actual role ID for security
        sessionRoleId: sessionRoleId,
        cookieCount: document.cookie.split(';').filter((c) => c.trim()).length,
        lastCheck: new Date(),
        apiAuthStatus: cookiePresence.isAuthenticated
      }

      setDebugInfo(info)
      return info
    } catch (error) {
      console.error('Error checking cookies:', error)
      return debugInfo
    }
  }, [debugInfo])

  const logCookieState = async () => {
    if (process.env.NODE_ENV != 'development') {
      return debugInfo
    }

    const info = await checkCookies()
    console.log('🍪 Cookie Debug Info:', info)
    console.log('🍪 Raw cookies:', document.cookie)
    return info
  }

  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV != 'development') {
      return
    }

    // Check inicial async
    checkCookies()

    // Check periódico cada 30 segundos (reducido para no sobrecargar API)
    const interval = setInterval(() => {
      checkCookies()
    }, 30000)

    return () => clearInterval(interval)
  }, [checkCookies])

  return {
    debugInfo,
    checkCookies,
    logCookieState
  }
}

export default useCookieDebug
