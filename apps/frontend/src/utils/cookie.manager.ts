import { getCookie, setCookie, deleteCookie } from 'cookies-next'

import { Role } from '@/modules/auth/types'
import { SessionStorageManager, Logger } from '.'
import { toSeconds } from './time'

/**
 * Utility class for managing authentication and role-related cookies.
 * Simplificado para manejar solo lo esencial: rol activo y verificación de autenticación.
 */
export class CookieManager {
  private static readonly USER_ACTIVE_ROLE_ID_KEY = 'user_active_role_id'

  private static readonly COOKIE_OPTIONS = {
    maxAge: toSeconds('10h'),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    httpOnly: false
  }

  // Rol gestion
  static setActiveRole(role: Role): void {
    if (!role?.id || !role?.name) {
      throw new Error('Rol inválido: faltan propiedades requeridas')
    }

    // Guardar ID en cookie
    this.setCookie(this.USER_ACTIVE_ROLE_ID_KEY, String(role.id))

    // Guardar rol completo en sessionStorage
    SessionStorageManager.saveActiveRole(role, this.COOKIE_OPTIONS.maxAge)
  }

  static getActiveRoleId(): string | null {
    return this.getCookie(this.USER_ACTIVE_ROLE_ID_KEY)
  }

  static removeActiveRole(): void {
    this.removeCookie(this.USER_ACTIVE_ROLE_ID_KEY)
    SessionStorageManager.removeActiveRole()
  }

  static hasActiveRole(): boolean {
    return !!this.getCookie(this.USER_ACTIVE_ROLE_ID_KEY) && SessionStorageManager.hasActiveRole()
  }

  static async checkAuthenticationStatus(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/cookies', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) return false

      const data = await response.json()
      return data.isAuthenticated
    } catch {
      return false
    }
  }

  static async clearAllAuthData(): Promise<void> {
    try {
      await fetch('/api/auth/cookies', {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch {
      // Ignorar errores de red
    }

    // Limpiar datos locales

    this.removeActiveRole()
    SessionStorageManager.removeUserData()
  }

  // Basic cookie management
  static getCookie(key: string): string | null {
    const value = getCookie(key)
    return value ? String(value) : null
  }

  static setCookie(key: string, value: string, options = this.COOKIE_OPTIONS): void {
    setCookie(key, value, options)
  }

  static removeCookie(key: string): void {
    deleteCookie(key)
  }

  static getTokenExpirySeconds(): number {
    return this.COOKIE_OPTIONS.maxAge
  }
}
