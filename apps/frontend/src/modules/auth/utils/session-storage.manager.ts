import { Logger } from '@/utils'

import { Permission } from '@/modules/auth/types'

import { UserActiveRole } from '@/modules/auth/sessionStore'
import { UserBasicInfo } from '@/modules/auth/types'

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
 *
 * Este manager es la fuente de verdad para datos persistentes básicos de sesión,
 * y puede ser usado tanto por hooks, stores Zustand, como utilidades fuera de React.
 */
export class SessionStorageManager {
  private static readonly USER_ACTIVE_ROLE_STORAGE_KEY = 'user_active_role'
  private static readonly USER_DATA_KEY = 'user_data'
  // Guarda el rol activo con expiración opcional
  static saveActiveRole(role: UserActiveRole, ttlSeconds?: number): void {
    try {
      if (ttlSeconds) {
        this.saveWithExpiry(this.USER_ACTIVE_ROLE_STORAGE_KEY, role, ttlSeconds)
      } else {
        sessionStorage.setItem(this.USER_ACTIVE_ROLE_STORAGE_KEY, JSON.stringify(role))
      }
    } catch (error) {
      Logger.error('Error saving active role:', error)
      throw error
    }
  }
  // Obtiene el rol activo, validando expiración
  static getActiveRole(): UserActiveRole | null {
    try {
      const roleWithExpiry = this.getWithExpiry<UserActiveRole>(this.USER_ACTIVE_ROLE_STORAGE_KEY)
      if (roleWithExpiry) return roleWithExpiry

      const roleData = sessionStorage.getItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
      if (!roleData) return null

      const parsedRole = JSON.parse(roleData) as UserActiveRole
      if (!parsedRole.id || !parsedRole.name) {
        this.removeActiveRole()
        return null
      }
      return parsedRole
    } catch (error) {
      Logger.error('Error parsing active role:', error)
      this.removeActiveRole()
      return null
    }
  }

  static removeActiveRole(): void {
    sessionStorage.removeItem(this.USER_ACTIVE_ROLE_STORAGE_KEY)
  }

  static hasActiveRole(): boolean {
    return !!this.getActiveRole()
  }

  static getActiveRoleName(): string | null {
    return this.getActiveRole()?.name || null
  }

  static getActiveRolePermissions(): Permission[] {
    return this.getActiveRole()?.permissions || []
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
  // Gestión de datos de usuario simplificada
  static saveUserBasicInfo(UserBasicInfo: UserBasicInfo, ttlSeconds?: number): void {
    try {
      // Log de entrada con timestamp
      const timestamp = new Date().toISOString()
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(
          `[${timestamp}][SessionStorageManager.saveUserBasicInfo] 🚀 Iniciando guardado de usuario:`,
          UserBasicInfo
        )
        window.console.log(
          `[${timestamp}][SessionStorageManager.saveUserBasicInfo] 🔍 Tipo de UserBasicInfo:`,
          typeof UserBasicInfo
        )
        window.console.log(
          `[${timestamp}][SessionStorageManager.saveUserBasicInfo] 🔍 Claves recibidas:`,
          UserBasicInfo ? Object.keys(UserBasicInfo) : 'null/undefined'
        )
      }

      // Validar que UserBasicInfo no sea null/undefined
      if (!UserBasicInfo || typeof UserBasicInfo !== 'object') {
        const error = `Datos de usuario inválidos: ${UserBasicInfo} (tipo: ${typeof UserBasicInfo})`
        Logger.error('Error: datos de usuario inválidos', { UserBasicInfo, type: typeof UserBasicInfo })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] ❌ Error:`, error)
        }
        throw new Error(error)
      }

      // Validar datos mínimos requeridos CON LOGS DETALLADOS
      const validationErrors: string[] = []
      const requiredFields = ['id', 'email', 'name']

      requiredFields.forEach((field) => {
        const value = UserBasicInfo[field as keyof UserBasicInfo]
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '')

        if (isEmpty) {
          validationErrors.push(field)
        }

        if (typeof window !== 'undefined' && window.console) {
          window.console.log(
            `[${timestamp}][SessionStorageManager.saveUserBasicInfo] 🔍 Campo ${field}: valor="${value}", tipo="${typeof value}", vacío=${isEmpty}`
          )
        }
      })

      if (validationErrors.length > 0) {
        const error = `Datos de usuario incompletos. Faltan: ${validationErrors.join(', ')}`
        Logger.error('Error: datos de usuario incompletos', { UserBasicInfo, validationErrors })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] ❌ Error:`, error, {
            UserBasicInfo,
            validationErrors,
            detailedAnalysis: requiredFields.map((field) => ({
              field,
              value: UserBasicInfo[field as keyof UserBasicInfo],
              type: typeof UserBasicInfo[field as keyof UserBasicInfo],
              isEmpty:
                !UserBasicInfo[field as keyof UserBasicInfo] ||
                (typeof UserBasicInfo[field as keyof UserBasicInfo] === 'string' &&
                  (UserBasicInfo[field as keyof UserBasicInfo] as string).trim() === '')
            }))
          })
        }
        throw new Error(error)
      }

      // Procesar datos con valores seguros
      const processedUserBasicInfo = {
        id: UserBasicInfo.id,
        email: UserBasicInfo.email,
        photoUrl:
          typeof UserBasicInfo.photoUrl === null ? null : UserBasicInfo.photoUrl || '/assets/images/default-profile-image.png',
        fullName: UserBasicInfo.fullName || undefined,
        fullLastName: UserBasicInfo.fullLastName || undefined,
        status: UserBasicInfo.status || undefined
      }

      // Log de los datos procesados
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] 📦 Datos procesados:`, processedUserBasicInfo)
      }

      // Guardar en sessionStorage con manejo de errores
      try {
        if (ttlSeconds) {
          this.saveWithExpiry(this.USER_DATA_KEY, processedUserBasicInfo, ttlSeconds)
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] 💾 Guardado con TTL de ${ttlSeconds}s`)
          }
        } else {
          sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(processedUserBasicInfo))
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] 💾 Guardado permanente`)
          }
        }
      } catch (storageError) {
        const errorMsg = storageError instanceof Error ? storageError.message : String(storageError)
        Logger.error('Error escribiendo en sessionStorage:', storageError)
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] ❌ Error de storage:`, errorMsg)
        }
        throw new Error(`Error guardando en sessionStorage: ${errorMsg}`)
      }

      // Verificar que se guardó correctamente con reintentos
      const maxVerificationAttempts = 3
      let verificationSuccess = false

      for (let attempt = 1; attempt <= maxVerificationAttempts; attempt++) {
        try {
          // Pequeña espera antes de la verificación
          const delay = attempt * 100
          if (delay > 0) {
            // Usar setTimeout síncrono simulado para no bloquear
            const start = Date.now()
            while (Date.now() - start < delay) {
              // Espera activa muy corta
            }
          }

          const saved = this.getUserBasicInfo()
          if (
            saved &&
            saved.id === processedUserBasicInfo.id &&
            saved.email === processedUserBasicInfo.email &&
            saved.fullName === processedUserBasicInfo.fullName
          ) {
            verificationSuccess = true
            if (typeof window !== 'undefined' && window.console) {
              window.console.log(
                `[${timestamp}][SessionStorageManager.saveUserBasicInfo] ✅ Verificación exitosa (intento ${attempt})`
              )
            }
            break
          } else {
            if (typeof window !== 'undefined' && window.console) {
              window.console.warn(
                `[${timestamp}][SessionStorageManager.saveUserBasicInfo] ⚠️ Verificación fallida (intento ${attempt}):`,
                {
                  saved,
                  expected: processedUserBasicInfo,
                  idsMatch: saved?.id === processedUserBasicInfo.id,
                  emailsMatch: saved?.email === processedUserBasicInfo.email,
                  namesMatch: saved?.fullName === processedUserBasicInfo.fullName
                }
              )
            }
          }
        } catch (verificationError) {
          if (typeof window !== 'undefined' && window.console) {
            window.console.warn(
              `[${timestamp}][SessionStorageManager.saveUserBasicInfo] ⚠️ Error en verificación (intento ${attempt}):`,
              verificationError
            )
          }
        }
      }

      if (!verificationSuccess) {
        const error = 'Falló la verificación de guardado después de múltiples intentos'
        Logger.error('Error de verificación:', { processedUserBasicInfo })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] ❌ ${error}`)
        }
        throw new Error(error)
      }

      // Log de éxito final
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(
          `[${timestamp}][SessionStorageManager.saveUserBasicInfo] 🎉 Usuario guardado y verificado exitosamente`
        )
      }
    } catch (error) {
      const timestamp = new Date().toISOString()
      if (typeof window !== 'undefined' && window.console) {
        window.console.error(`[${timestamp}][SessionStorageManager.saveUserBasicInfo] 💥 Error crítico en guardado:`, error)
      }
      Logger.error('Error saving user data:', error)
      throw error
    }
  }
  static getUserBasicInfo<T = UserBasicInfo>(): T | null {
    const timestamp = new Date().toISOString()
    try {
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.getUserBasicInfo] 🔍 Obteniendo datos de usuario...`)
      }

      // Intentar obtener con TTL primero
      const userWithExpiry = this.getWithExpiry<T>(this.USER_DATA_KEY)
      if (userWithExpiry) {
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(
            `[${timestamp}][SessionStorageManager.getUserBasicInfo] ✅ Datos con TTL encontrados:`,
            userWithExpiry
          )
        }
        return userWithExpiry
      }

      // Intentar obtener datos normales
      const data = sessionStorage.getItem(this.USER_DATA_KEY)
      if (!data) {
        if (typeof window !== 'undefined' && window.console) {
          window.console.warn(
            `[${timestamp}][SessionStorageManager.getUserBasicInfo] ⚠️ No se encontraron datos en sessionStorage`
          )
        }
        return null
      }

      const parsedData = JSON.parse(data) as T
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.getUserBasicInfo] ✅ Datos encontrados:`, parsedData)
      }

      return parsedData
    } catch (error) {
      Logger.error('Error getting user data:', error)
      if (typeof window !== 'undefined' && window.console) {
        window.console.error(`[${timestamp}][SessionStorageManager.getUserBasicInfo] ❌ Error:`, error)
      }
      return null
    }
  }

  static removeUserBasicInfo(): void {
    sessionStorage.removeItem(this.USER_DATA_KEY)
  } // Limpia todos los datos de sesión
  static clearAllData(): void {
    this.removeActiveRole()
    this.removeUserBasicInfo()
  }

  // Métodos de expiración
  static saveWithExpiry<T>(key: string, value: T, ttlSeconds: number): void {
    const now = new Date()
    const item: StorageItemWithExpiry<T> = {
      value: value,
      expiry: now.getTime() + ttlSeconds * 1000
    }
    sessionStorage.setItem(key, JSON.stringify(item))
  }

  static getWithExpiry<T>(key: string): T | null {
    const itemStr = sessionStorage.getItem(key)
    if (!itemStr) return null
    try {
      const item: StorageItemWithExpiry<T> = JSON.parse(itemStr)
      const now = new Date()
      if (typeof item.expiry !== 'number' || typeof item.value === 'undefined') return null
      if (now.getTime() > item.expiry) {
        sessionStorage.removeItem(key)
        return null
      }
      return item.value
    } catch (error) {
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
