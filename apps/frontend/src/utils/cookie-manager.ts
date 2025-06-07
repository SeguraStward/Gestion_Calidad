import Cookies from 'js-cookie'
import { Role } from '@/modules/auth/auth.service'

export interface UserActiveRole extends Role {
  isActive: boolean
  selectedAt: Date
}

export class CookieManager {
  private static readonly USER_ACTIVE_ROLE_KEY = 'user_active_role'
  private static readonly USER_ACTIVE_ROLE_ID_KEY = 'user_active_role_id'
  private static readonly COOKIE_OPTIONS = {
    expires: 7, // 7 días
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
  }

  /**
   * Guarda el rol activo del usuario en una cookie
   */
  static setActiveRole(role: Role): void {
    const activeRole: UserActiveRole = {
      ...role,
      isActive: true,
      selectedAt: new Date()
    }

    Cookies.set(this.USER_ACTIVE_ROLE_KEY, JSON.stringify(activeRole), this.COOKIE_OPTIONS)
    Cookies.set(this.USER_ACTIVE_ROLE_ID_KEY, JSON.stringify(activeRole.id), this.COOKIE_OPTIONS)
  }

  /**
   * Obtiene el rol activo del usuario desde la cookie
   */
  static getActiveRole(): UserActiveRole | null {
    try {
      const roleData = Cookies.get(this.USER_ACTIVE_ROLE_KEY)
      if (!roleData) return null

      const parsedRole = JSON.parse(roleData) as UserActiveRole

      // Verificar que tenga la estructura correcta
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

  /**
   * Elimina el rol activo de las cookies
   */
  static removeActiveRole(): void {
    Cookies.remove(this.USER_ACTIVE_ROLE_KEY)
    Cookies.remove(this.USER_ACTIVE_ROLE_ID_KEY)
  }

  /**
   * Verifica si hay un rol activo
   */
  static hasActiveRole(): boolean {
    const roleData = Cookies.get(this.USER_ACTIVE_ROLE_KEY)
    const roleId = Cookies.get(this.USER_ACTIVE_ROLE_ID_KEY)
    return !!(roleData || roleId)
  }

  /**
   * Actualiza el timestamp del rol activo sin cambiar otros datos
   */
  static refreshActiveRole(): void {
    const currentRole = this.getActiveRole()
    if (currentRole) {
      this.setActiveRole(currentRole)
    }
  }
}
