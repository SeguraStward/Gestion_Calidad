import { Role } from '@/modules/auth/interfaces'
import Cookies from 'js-cookie'
import { LogManager } from './log-manager'

export interface UserActiveRole extends Role {
  isActive: boolean
  selectedAt: Date
}

export class CookieManager {
  private static readonly USER_ACTIVE_ROLE_KEY = 'user_active_role'
  private static readonly USER_ACTIVE_ROLE_ID_KEY = 'user_active_role_id'
  private static readonly COOKIE_OPTIONS = {
    expires: 7, // days
    secure: process.env.NODE_ENV == 'production',
    sameSite: 'lax' as const
  }

  static setActiveRole(role: Role): void {
    const activeRole: UserActiveRole = {
      ...role,
      isActive: true,
      selectedAt: new Date()
    }

    Cookies.set(this.USER_ACTIVE_ROLE_KEY, JSON.stringify(activeRole), this.COOKIE_OPTIONS)
    Cookies.set(this.USER_ACTIVE_ROLE_ID_KEY, activeRole.id, this.COOKIE_OPTIONS)
  }

  static getActiveRole(): UserActiveRole | null {
    try {
      const roleData = Cookies.get(this.USER_ACTIVE_ROLE_KEY)
      if (!roleData) return null

      const parsedRole = JSON.parse(roleData) as UserActiveRole

      if (!parsedRole.id || !parsedRole.name) {
        this.removeActiveRole()
        return null
      }

      return parsedRole
    } catch (error) {
      console.error('Error parsing active role from cookie:', error)
      this.removeActiveRole()
      return null
    }
  }

  static removeActiveRole(): void {
    Cookies.remove(this.USER_ACTIVE_ROLE_KEY)
    Cookies.remove(this.USER_ACTIVE_ROLE_ID_KEY)
  }

  static hasActiveRole(): boolean {
    const roleData = Cookies.get(this.USER_ACTIVE_ROLE_KEY)
    const roleId = Cookies.get(this.USER_ACTIVE_ROLE_ID_KEY)
    return !!(roleData && roleId)
  }

  static refreshActiveRole(): void {
    const currentRole = this.getActiveRole()
    if (currentRole) {
      this.setActiveRole(currentRole)
    }
  }

  static deleteTokens(): void {
    Cookies.remove('auth_token')
    Cookies.remove('refresh_token')
    LogManager.debug('Log Out: Tokens deleted successfully.')
  }
}
