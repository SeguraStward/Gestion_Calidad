import { CookiePresence } from '../types'

/**
 * Cookie Detection Service
 * Detects HttpOnly cookie presence through API calls
 * No cookie reading - only presence detection
 */
export class CookieDetectionService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || ''
  private static abortController: AbortController | null = null

  /**
   * Cancel any ongoing requests
   */
  static cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * Check if authentication cookies are present through API validation
   * Returns presence status of all 3 cookies: auth_token, refresh_token, user_active_role_id
   */
  static async checkCookiePresence(): Promise<CookiePresence> {
    try {
      // Cancel previous request if any
      this.cancelRequests()

      // Create new abort controller
      this.abortController = new AbortController()

      // Check auth token presence by calling /auth/me (backend endpoint)
      const authResponse = await fetch(`${this.API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        signal: this.abortController.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      })

      const hasAuthToken = authResponse.ok
      let hasRefreshToken = hasAuthToken // If auth works, refresh token is also present
      let hasActiveRole = false

      // Only check active role if authenticated
      if (hasAuthToken) {
        try {
          const roleResponse = await fetch(`${this.API_URL}/auth/active-role`, {
            method: 'GET',
            credentials: 'include',
            signal: this.abortController.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json'
            }
          })

          if (roleResponse.ok) {
            const roleData = await roleResponse.json()
            hasActiveRole = roleData.activeRoleId !== null
          }
        } catch (error) {
          // If role check fails or is aborted, assume no active role
          if (error instanceof Error && error.name !== 'AbortError') {
            console.warn('Role check failed:', error)
          }
          hasActiveRole = false
        }
      } else {
        hasRefreshToken = false
      }

      this.abortController = null // Reset after successful request

      return {
        hasAuthToken,
        hasRefreshToken,
        hasActiveRole,
        isAuthenticated: hasAuthToken
      }
    } catch (error) {
      // Don't log AbortError as it's intentional
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Cookie detection error:', error)
      }

      this.abortController = null

      // Network error or API unavailable
      return {
        hasAuthToken: false,
        hasRefreshToken: false,
        hasActiveRole: false,
        isAuthenticated: false
      }
    }
  }
  /**
   * Quick authentication check - only validates auth token
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      // Cancel previous request if any
      this.cancelRequests()

      // Create new abort controller
      this.abortController = new AbortController()

      const response = await fetch(`${this.API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        signal: this.abortController.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      })

      this.abortController = null
      return response.ok
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Auth check failed:', error)
      }
      this.abortController = null
      return false
    }
  }
}
