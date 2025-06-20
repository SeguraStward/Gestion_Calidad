import { getCookie, setCookie, deleteCookie } from 'cookies-next'

import { Role } from '@/modules/auth/types'
import { SessionStorageManager, Logger } from '.'
import { toSeconds } from './time'   

/**
 * Utility class for managing authentication and role-related cookies in the frontend application.
 *
 * Provides static methods to set, get, and remove authentication tokens and active user role information
 * in cookies, as well as synchronize with local storage. Also includes diagnostic utilities for
 * authentication state and cookie/localStorage status.
 *
 * @remarks
 * - Uses secure cookies in production.
 * - Relies on external `Logger`, `SessionStorageManager`, and cookie utility functions (`getCookie`, `setCookie`, `deleteCookie`).
 * - Intended for use in browser environments.
 */
export class CookieManager {
  private static readonly USER_ACTIVE_ROLE_ID_KEY = 'user_active_role_id'
  private static readonly AUTH_TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'

  // TODO env variable for cookie expiration base on jwt expiration
  private static readonly COOKIE_OPTIONS = {
    maxAge: toSeconds('10m'),
    secure: process.env.NODE_ENV == 'production',
    sameSite: 'lax' as const
  }

  // active rol id manage
  static setActiveRole(role: Role): void {
    try {
      Logger.log('🍪 CookieManager.setActiveRole - Guardando rol:', role)
      if (!role || !role.id || !role.name) {
        Logger.error('❌ Rol inválido - falta id o name:', role)
        throw new Error('Rol inválido: faltan propiedades requeridas')
      }
      const activeRole: Role = {
        id: String(role.id),
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || []
      }
      this.setCookie(this.USER_ACTIVE_ROLE_ID_KEY, String(activeRole.id))
      Logger.log('✅ ID del rol guardado en cookie:', activeRole.id)
      SessionStorageManager.saveActiveRole(activeRole, this.COOKIE_OPTIONS.maxAge)
      Logger.log('🔍 Rol almacenado:', {
        id: activeRole.id,
        name: activeRole.name,
        permissionsCount: activeRole.permissions?.length || 0
      })
    } catch (error) {
      Logger.error('❌ CookieManager.setActiveRole - Error:', error)
      throw error
    }
  }

  static getActiveRoleId(): string | null {
    return this.getCookie(this.USER_ACTIVE_ROLE_ID_KEY)
  }

  static removeActiveRole(): void {
    this.removeCookie(this.USER_ACTIVE_ROLE_ID_KEY)
    SessionStorageManager.removeActiveRole()
  }

  static hasActiveRole(): boolean {
    const roleId = this.getCookie(this.USER_ACTIVE_ROLE_ID_KEY)
    return !!roleId && SessionStorageManager.hasActiveRole()
  }

  static refreshActiveRole(): void {
    const currentRole = SessionStorageManager.getActiveRole()
    if (currentRole) {
      this.setActiveRole(currentRole)
    }
  }

  // auth token manage
  static deleteTokens(): void {
    this.removeCookie(this.AUTH_TOKEN_KEY)
    this.removeCookie(this.REFRESH_TOKEN_KEY)
    Logger.debug('Log Out: Tokens deleted successfully.')
  }

  static getAuthToken(): string | null {
    return this.getCookie(this.AUTH_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return this.getCookie(this.REFRESH_TOKEN_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  static clearAllAuthData(): void {
    this.deleteTokens()
    this.removeActiveRole()
    SessionStorageManager.removeUserData()
  }

  // cookie management
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

  static hasValue(key: string): boolean {
    return !!getCookie(key)
  }

  // Expiration management
  static getTokenExpirySeconds(): number {
    return this.COOKIE_OPTIONS.maxAge
  }

  static refreshSessionData(): void {
    const currentRole = SessionStorageManager.getActiveRole()
    const userData = SessionStorageManager.getUserData<any>()

    if (currentRole) {
      SessionStorageManager.saveActiveRole(currentRole, this.COOKIE_OPTIONS.maxAge)
    }

    if (userData) {
      SessionStorageManager.saveUserData(userData, this.COOKIE_OPTIONS.maxAge)
    }

    Logger.log('🔄 Expiración de datos en sessionStorage actualizada')
  }
}
