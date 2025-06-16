import { Role } from '@/modules/auth/interfaces'
import Cookies from 'js-cookie'
import { LogManager } from './log-manager'

export interface UserActiveRole extends Role {
  isActive: boolean
  selectedAt: Date
}

export class CookieManager {
  private static readonly USER_ACTIVE_ROLE_ID_KEY = 'user_active_role_id'
  private static readonly USER_ACTIVE_ROLE_STORAGE_KEY = 'user_active_role_full'
  private static readonly COOKIE_OPTIONS = {
    expires: 7, // days
    secure: process.env.NODE_ENV == 'production',
    sameSite: 'lax' as const
  }

  static setActiveRole(role: Role): void {
    try {
      console.log('🍪 CookieManager.setActiveRole - Guardando rol:', role)

      // Validar que el rol tiene todas las propiedades necesarias
      if (!role || !role.id || !role.name) {
        console.error('❌ Rol inválido - falta id o name:', role)
        throw new Error('Rol inválido: faltan propiedades requeridas')
      }

      const activeRole: Role = {
        id: String(role.id),
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || []
      }

      // Guardar solo el ID en la cookie (pequeño y eficiente)
      Cookies.set(this.USER_ACTIVE_ROLE_ID_KEY, String(activeRole.id), this.COOKIE_OPTIONS)
      console.log('✅ ID del rol guardado en cookie:', activeRole.id)

      // Guardar el rol completo en localStorage (sin límites de tamaño)
      localStorage.setItem(this.USER_ACTIVE_ROLE_STORAGE_KEY, JSON.stringify(activeRole))
      console.log('✅ Rol completo guardado en localStorage')

      console.log('🔍 Rol almacenado:', {
        id: activeRole.id,
        name: activeRole.name,
        permissionsCount: activeRole.permissions?.length || 0
      })
    } catch (error) {
      console.error('❌ CookieManager.setActiveRole - Error:', error)
      throw error
    }
  }

  static getActiveRole(): UserActiveRole | null {
    try {
      // Primero verificar si hay un ID en la cookie
      const roleId = Cookies.get(this.USER_ACTIVE_ROLE_ID_KEY)
      if (!roleId) {
        console.log('🍪 CookieManager.getActiveRole - No se encontró ID de rol activo en cookie')
        return null
      }

      // Obtener el rol completo del localStorage
      const roleData = localStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
      if (!roleData) {
        console.log('🍪 CookieManager.getActiveRole - No se encontró rol completo en localStorage')
        return null
      }

      const parsedRole = JSON.parse(roleData) as UserActiveRole
      console.log('🍪 CookieManager.getActiveRole - Rol parseado:', parsedRole)

      // Verificar que el ID coincida
      if (parsedRole.id !== roleId) {
        console.warn('⚠️ CookieManager.getActiveRole - ID de cookie no coincide con localStorage, limpiando datos')
        this.removeActiveRole()
        return null
      }

      if (!parsedRole.id || !parsedRole.name) {
        console.warn('⚠️ CookieManager.getActiveRole - Rol en localStorage es inválido, removiendo:', parsedRole)
        this.removeActiveRole()
        return null
      }

      console.log('✅ CookieManager.getActiveRole - Rol válido encontrado:', {
        id: parsedRole.id,
        name: parsedRole.name,
        permissionsCount: parsedRole.permissions?.length || 0
      })

      return parsedRole
    } catch (error) {
      console.error('❌ CookieManager.getActiveRole - Error parsing active role:', error)
      this.removeActiveRole()
      return null
    }
  }

  static removeActiveRole(): void {
    Cookies.remove(this.USER_ACTIVE_ROLE_ID_KEY)
    localStorage.removeItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
  }

  static hasActiveRole(): boolean {
    const roleData = localStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
    const roleId = Cookies.get(this.USER_ACTIVE_ROLE_ID_KEY)
    return !!(roleData && roleId)
  }

  static refreshActiveRole(): void {
    const currentRole = this.getActiveRole()
    if (currentRole) {
      this.setActiveRole(currentRole)
    }
  }

  // Métodos de conveniencia para obtener información específica del rol
  static getActiveRoleId(): string | null {
    const role = this.getActiveRole()
    return role?.id || null
  }

  static getActiveRoleName(): string | null {
    const role = this.getActiveRole()
    return role?.name || null
  }

  static getActiveRolePermissions(): any[] {
    const role = this.getActiveRole()
    return role?.permissions || []
  }

  static getActiveRoleInfo(): { id: string; name: string; permissionsCount: number } | null {
    const role = this.getActiveRole()
    if (!role) return null

    return {
      id: role.id,
      name: role.name,
      permissionsCount: role.permissions?.length || 0
    }
  }

  static deleteTokens(): void {
    Cookies.remove('auth_token')
    Cookies.remove('refresh_token')
    LogManager.debug('Log Out: Tokens deleted successfully.')
  }

  // Método de diagnóstico para debug
  static diagnoseRoleCookies(): {
    hasRoleData: boolean
    hasRoleId: boolean
    roleDataSize: number
    roleIdValue: string | null
    rawCookieCount: number
    totalCookieSize: number
    canParseRoleData: boolean
    parseError?: string
  } {
    const roleData = localStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
    const roleId = Cookies.get(this.USER_ACTIVE_ROLE_ID_KEY)
    const allCookies = document.cookie

    let canParseRoleData = false
    let parseError: string | undefined

    if (roleData) {
      try {
        JSON.parse(roleData)
        canParseRoleData = true
      } catch (error) {
        parseError = error instanceof Error ? error.message : 'Error desconocido'
      }
    }

    return {
      hasRoleData: !!roleData,
      hasRoleId: !!roleId,
      roleDataSize: roleData?.length || 0,
      roleIdValue: roleId || null,
      rawCookieCount: allCookies.split(';').length,
      totalCookieSize: allCookies.length,
      canParseRoleData,
      parseError
    }
  }
}
