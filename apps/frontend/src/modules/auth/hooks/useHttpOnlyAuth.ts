import { useState, useEffect, useCallback } from 'react'

interface AuthStatus {
  isAuthenticated: boolean
  hasAuthToken: boolean
  hasRefreshToken: boolean
  loading: boolean
  error: string | null
}

/**
 * Hook para manejar el estado de autenticación con cookies HTTP-only
 * Proporciona métodos para verificar el estado de autenticación sin exponer los tokens
 * Centralizado en modules/auth/hooks/
 */
export function useHttpOnlyAuth() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    hasAuthToken: false,
    hasRefreshToken: false,
    loading: true,
    error: null
  })

  // Verificar el estado de autenticación (memoizado para evitar re-creaciones)
  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthStatus((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/cookies', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store' // Evitar cache para obtener estado actual
      })

      if (!response.ok) {
        throw new Error('Failed to check auth status')
      }

      const data = await response.json()

      setAuthStatus({
        isAuthenticated: data.isAuthenticated,
        hasAuthToken: data.hasAuthToken,
        hasRefreshToken: data.hasRefreshToken,
        loading: false,
        error: null
      })

      return data.isAuthenticated
    } catch (error) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
      return false
    }
  }, [])

  // Establecer tokens de autenticación (llamado después del login)
  const setAuthTokens = useCallback(
    async (authToken: string, refreshToken: string) => {
      try {
        const response = await fetch('/api/auth/cookies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ authToken, refreshToken })
        })

        if (!response.ok) {
          throw new Error('Failed to set auth tokens')
        }

        // Actualizar el estado después de establecer las cookies
        await checkAuthStatus()
        return true
      } catch (error) {
        setAuthStatus((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to set tokens'
        }))
        return false
      }
    },
    [checkAuthStatus]
  )

  // Cerrar sesión (eliminar cookies)
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/cookies', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      setAuthStatus({
        isAuthenticated: false,
        hasAuthToken: false,
        hasRefreshToken: false,
        loading: false,
        error: null
      })

      return true
    } catch (error) {
      setAuthStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to logout'
      }))
      return false
    }
  }, [])

  // Verificar el estado al montar el componente
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  return {
    ...authStatus,
    checkAuthStatus,
    setAuthTokens,
    logout,
    refresh: checkAuthStatus
  }
}

export default useHttpOnlyAuth
