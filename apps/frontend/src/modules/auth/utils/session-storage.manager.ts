import { Logger } from '@/utils'

import { Permission } from '@/modules/auth/types'

import { UserActiveRole } from '@/modules/auth/sessionStore'
import { UserProfile } from '@/modules/auth/types'

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
  static saveUserProfile(UserProfile: UserProfile, ttlSeconds?: number): void {
    try {
      // Log de entrada con timestamp
      const timestamp = new Date().toISOString()
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 🚀 Iniciando guardado de usuario:`, UserProfile)
        window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 🔍 Tipo de UserProfile:`, typeof UserProfile)
        window.console.log(
          `[${timestamp}][SessionStorageManager.saveUserProfile] 🔍 Claves recibidas:`,
          UserProfile ? Object.keys(UserProfile) : 'null/undefined'
        )
      }

      // Validar que UserProfile no sea null/undefined
      if (!UserProfile || typeof UserProfile !== 'object') {
        const error = `Datos de usuario inválidos: ${UserProfile} (tipo: ${typeof UserProfile})`
        Logger.error('Error: datos de usuario inválidos', { UserProfile, type: typeof UserProfile })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserProfile] ❌ Error:`, error)
        }
        throw new Error(error)
      }

      // Validar datos mínimos requeridos CON LOGS DETALLADOS
      const validationErrors: string[] = []
      const requiredFields = ['id', 'email', 'name']

      requiredFields.forEach((field) => {
        const value = UserProfile[field as keyof UserProfile]
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '')

        if (isEmpty) {
          validationErrors.push(field)
        }

        if (typeof window !== 'undefined' && window.console) {
          window.console.log(
            `[${timestamp}][SessionStorageManager.saveUserProfile] 🔍 Campo ${field}: valor="${value}", tipo="${typeof value}", vacío=${isEmpty}`
          )
        }
      })

      if (validationErrors.length > 0) {
        const error = `Datos de usuario incompletos. Faltan: ${validationErrors.join(', ')}`
        Logger.error('Error: datos de usuario incompletos', { UserProfile, validationErrors })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserProfile] ❌ Error:`, error, {
            UserProfile,
            validationErrors,
            detailedAnalysis: requiredFields.map((field) => ({
              field,
              value: UserProfile[field as keyof UserProfile],
              type: typeof UserProfile[field as keyof UserProfile],
              isEmpty:
                !UserProfile[field as keyof UserProfile] ||
                (typeof UserProfile[field as keyof UserProfile] === 'string' &&
                  (UserProfile[field as keyof UserProfile] as string).trim() === '')
            }))
          })
        }
        throw new Error(error)
      }

      // Procesar datos con valores seguros
      const processedUserProfile = {
        id: UserProfile.id,
        email: UserProfile.email,
        photoUrl:
          typeof UserProfile.photoUrl === null ? null : UserProfile.photoUrl || '/assets/images/default-profile-image.png',
        fullName: UserProfile.fullName || undefined,
        fullLastName: UserProfile.fullLastName || undefined,
        status: UserProfile.status || undefined
      }

      // Log de los datos procesados
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 📦 Datos procesados:`, processedUserProfile)
      }

      // Guardar en sessionStorage con manejo de errores
      try {
        if (ttlSeconds) {
          this.saveWithExpiry(this.USER_DATA_KEY, processedUserProfile, ttlSeconds)
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 💾 Guardado con TTL de ${ttlSeconds}s`)
          }
        } else {
          sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(processedUserProfile))
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 💾 Guardado permanente`)
          }
        }
      } catch (storageError) {
        const errorMsg = storageError instanceof Error ? storageError.message : String(storageError)
        Logger.error('Error escribiendo en sessionStorage:', storageError)
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserProfile] ❌ Error de storage:`, errorMsg)
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

          const saved = this.getUserProfile()
          if (
            saved &&
            saved.id === processedUserProfile.id &&
            saved.email === processedUserProfile.email &&
            saved.fullName === processedUserProfile.fullName
          ) {
            verificationSuccess = true
            if (typeof window !== 'undefined' && window.console) {
              window.console.log(
                `[${timestamp}][SessionStorageManager.saveUserProfile] ✅ Verificación exitosa (intento ${attempt})`
              )
            }
            break
          } else {
            if (typeof window !== 'undefined' && window.console) {
              window.console.warn(
                `[${timestamp}][SessionStorageManager.saveUserProfile] ⚠️ Verificación fallida (intento ${attempt}):`,
                {
                  saved,
                  expected: processedUserProfile,
                  idsMatch: saved?.id === processedUserProfile.id,
                  emailsMatch: saved?.email === processedUserProfile.email,
                  namesMatch: saved?.fullName === processedUserProfile.fullName
                }
              )
            }
          }
        } catch (verificationError) {
          if (typeof window !== 'undefined' && window.console) {
            window.console.warn(
              `[${timestamp}][SessionStorageManager.saveUserProfile] ⚠️ Error en verificación (intento ${attempt}):`,
              verificationError
            )
          }
        }
      }

      if (!verificationSuccess) {
        const error = 'Falló la verificación de guardado después de múltiples intentos'
        Logger.error('Error de verificación:', { processedUserProfile })
        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`[${timestamp}][SessionStorageManager.saveUserProfile] ❌ ${error}`)
        }
        throw new Error(error)
      }

      // Log de éxito final
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.saveUserProfile] 🎉 Usuario guardado y verificado exitosamente`)
      }
    } catch (error) {
      const timestamp = new Date().toISOString()
      if (typeof window !== 'undefined' && window.console) {
        window.console.error(`[${timestamp}][SessionStorageManager.saveUserProfile] 💥 Error crítico en guardado:`, error)
      }
      Logger.error('Error saving user data:', error)
      throw error
    }
  }
  static getUserProfile<T = UserProfile>(): T | null {
    const timestamp = new Date().toISOString()
    try {
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.getUserProfile] 🔍 Obteniendo datos de usuario...`)
      }

      // Intentar obtener con TTL primero
      const userWithExpiry = this.getWithExpiry<T>(this.USER_DATA_KEY)
      if (userWithExpiry) {
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][SessionStorageManager.getUserProfile] ✅ Datos con TTL encontrados:`, userWithExpiry)
        }
        return userWithExpiry
      }

      // Intentar obtener datos normales
      const data = sessionStorage.getItem(this.USER_DATA_KEY)
      if (!data) {
        if (typeof window !== 'undefined' && window.console) {
          window.console.warn(`[${timestamp}][SessionStorageManager.getUserProfile] ⚠️ No se encontraron datos en sessionStorage`)
        }
        return null
      }

      const parsedData = JSON.parse(data) as T
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][SessionStorageManager.getUserProfile] ✅ Datos encontrados:`, parsedData)
      }

      return parsedData
    } catch (error) {
      Logger.error('Error getting user data:', error)
      if (typeof window !== 'undefined' && window.console) {
        window.console.error(`[${timestamp}][SessionStorageManager.getUserProfile] ❌ Error:`, error)
      }
      return null
    }
  }

  static removeUserProfile(): void {
    sessionStorage.removeItem(this.USER_DATA_KEY)
  } // Limpia todos los datos de sesión
  static clearAllData(): void {
    this.removeActiveRole()
    this.removeUserProfile()
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
