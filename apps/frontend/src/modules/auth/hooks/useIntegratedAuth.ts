import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth as useMainAuth } from './useAuth'

/**
 * Hook integrado para manejar autenticación completa
 * Centraliza toda la lógica de autenticación en un solo hook
 * Combina HTTP-only cookies para tokens y cookies normales para roles
 */
export function useIntegratedAuth() {
  const router = useRouter()
  const auth = useMainAuth()

  // Login completo: establece tokens y redirecciona
  const login = useCallback(
    async (authToken: string, refreshToken: string, redirectTo: string = '/') => {
      try {
        const success = await auth.setAuthTokens(authToken, refreshToken)
        if (success) {
          router.push(redirectTo)
          return true
        }
        return false
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },
    [auth, router]
  )

  // Verificar estado completo de autenticación
  const checkFullAuthStatus = useCallback(async () => {
    const tokensValid = await auth.checkAuthStatus()
    const roleSelected = !!auth.activeRole

    return {
      tokensValid,
      roleSelected,
      fullyAuthenticated: tokensValid && roleSelected
    }
  }, [auth])

  return {
    // Todo el estado y métodos del hook principal
    ...auth,

    // Métodos adicionales
    login,
    checkFullAuthStatus,

    // Alias y estado combinado
    fullyAuthenticated: auth.fullyAuthenticated
  }
}

// Mantener compatibilidad con importaciones directas
export { useAuth } from './useAuth'
export { useHttpOnlyAuth } from './useHttpOnlyAuth'
export { useCookieDebug } from './useCookieDebug'
export { useRoleSelection } from './useRoleSelection'
export { useLoginCallback } from './useLoginCallback'

export default useIntegratedAuth
