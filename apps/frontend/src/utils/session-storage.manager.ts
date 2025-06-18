import { Logger } from '.'

import { Role, Permission } from '@/modules/auth/types'

export type UserActiveRole = Role

export type UserData = {
  id: string
  name: string
  email: string
  photoUrl: string | null
}

interface StorageItemWithExpiry<T> {
  value: T
  expiry: number // timestamp ms
}

/**
 * Utility class for managing user-related data in sessionStorage.
 * Handles saving, retrieving, and removing the active user role and user data.
 * Also provides diagnostic information about sessionStorage usage.
 *
 * Note: Unlike localStorage, sessionStorage data is cleared when the page session ends (tab is closed).
 */
export class SessionStorageManager {
  private static readonly USER_ACTIVE_ROLE_STORAGE_KEY = 'user_active_role'
  private static readonly USER_DATA_KEY = 'user_data'

  // active Role
  static saveActiveRole(role: Role, ttlSeconds?: number): void {
    try {
      const activeRole: UserActiveRole = role

      if (ttlSeconds) {
        this.saveWithExpiry(this.USER_ACTIVE_ROLE_STORAGE_KEY, activeRole, ttlSeconds)
        Logger.log('✅ Rol completo guardado en sessionStorage con expiración')
      } else {
        sessionStorage.setItem(this.USER_ACTIVE_ROLE_STORAGE_KEY, JSON.stringify(activeRole))
        Logger.log('✅ Rol completo guardado en sessionStorage')
      }
    } catch (error) {
      Logger.error('❌ SessionStorageManager.saveActiveRole - Error:', error)
      throw error
    }
  }

  static getActiveRole(): UserActiveRole | null {
    try {
      // Primero intenta obtener con expiración
      const roleWithExpiry = this.getWithExpiry<UserActiveRole>(this.USER_ACTIVE_ROLE_STORAGE_KEY)
      if (roleWithExpiry) {
        Logger.log('✅ SessionStorageManager.getActiveRole - Rol válido encontrado con expiración:', {
          id: roleWithExpiry.id,
          name: roleWithExpiry.name,
          permissionsCount: roleWithExpiry.permissions?.length || 0
        })
        return roleWithExpiry
      }

      // Si no hay con expiración, intenta el método tradicional
      const roleData = sessionStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
      if (!roleData) {
        Logger.log('SessionStorageManager.getActiveRole - No se encontró rol completo en sessionStorage')
        return null
      }

      const parsedRole = JSON.parse(roleData) as UserActiveRole
      Logger.log('SessionStorageManager.getActiveRole - Rol parseado:', parsedRole)

      if (!parsedRole.id || !parsedRole.name) {
        Logger.warn('⚠️ SessionStorageManager.getActiveRole - Rol en sessionStorage es inválido:', parsedRole)
        this.removeActiveRole()
        return null
      }

      Logger.log('✅ SessionStorageManager.getActiveRole - Rol válido encontrado:', {
        id: parsedRole.id,
        name: parsedRole.name,
        permissionsCount: parsedRole.permissions?.length || 0
      })

      return parsedRole
    } catch (error) {
      Logger.error('❌ SessionStorageManager.getActiveRole - Error parsing active role:', error)
      this.removeActiveRole()
      return null
    }
  }

  static removeActiveRole(): void {
    sessionStorage.removeItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
  }

  static hasActiveRole(): boolean {
    const roleData = sessionStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
    return !!roleData
  }

  static getActiveRoleName(): string | null {
    const role = this.getActiveRole()
    return role?.name || null
  }

  static getActiveRolePermissions(): Permission[] {
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

  // User
  static saveUserData(userData: UserData, ttlSeconds?: number): void {
    try {
      const processedUserData = {
        ...userData,
        photoUrl: userData.photoUrl || 'public/assets/images/default-profile-image.png'
      }

      if (ttlSeconds) {
        this.saveWithExpiry(this.USER_DATA_KEY, processedUserData, ttlSeconds)
        Logger.log('✅ Usuario guardado en sessionStorage con expiración')
      } else {
        sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(processedUserData))
        Logger.log('✅ Usuario guardado en sessionStorage')
      }
    } catch (error) {
      Logger.error('❌ SessionStorageManager.saveUserData - Error:', error)
    }
  }

  static getUserData<T = UserData>(): T | null {
    try {
      // Primero intenta obtener con expiración
      const userWithExpiry = this.getWithExpiry<T>(this.USER_DATA_KEY)
      if (userWithExpiry) {
        return userWithExpiry
      }

      // Si no hay con expiración, intenta el método tradicional
      const data = sessionStorage.getItem(this.USER_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      Logger.error('❌ SessionStorageManager.getUserData - Error:', error)
      return null
    }
  }

  static removeUserData(): void {
    sessionStorage.removeItem(this.USER_DATA_KEY)
  }

  // General
  static clearAllData(): void {
    this.removeActiveRole()
    this.removeUserData()
    Logger.log('✅ SessionStorageManager.clearAllData - All sessionStorage data cleared')
  }

  // Expiration management
  static saveWithExpiry<T>(key: string, value: T, ttlSeconds: number): void {
    const now = new Date()
    const item: StorageItemWithExpiry<T> = {
      value: value,
      expiry: now.getTime() + ttlSeconds * 1000
    }
    sessionStorage.setItem(key, JSON.stringify(item))
    Logger.log(`✅ Dato guardado con expiración en ${ttlSeconds}s`, { key })
  }

  static getWithExpiry<T>(key: string): T | null {
    const itemStr = sessionStorage.getItem(key)
    if (!itemStr) return null

    try {
      const item: StorageItemWithExpiry<T> = JSON.parse(itemStr)
      const now = new Date()

      // Verifica si ha expirado
      if (now.getTime() > item.expiry) {
        Logger.log(`⏰ Dato expirado y eliminado`, { key })
        sessionStorage.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      Logger.error('❌ Error al recuperar dato con expiración:', error)
      return null
    }
  }

  static isAvailable(): boolean {
    try {
      const testKey = '__test__'
      sessionStorage.setItem(testKey, testKey)
      sessionStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }
}
