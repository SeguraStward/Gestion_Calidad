import { AxiosError } from 'axios'
import { HttpClient } from '@/lib/http-client'
import { UserRolesResponse, UserProfile } from './types'

// Custom error types for better error handling
export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

export class AuthNetworkError extends AuthServiceError {
  status: number | undefined
  data: any

  constructor(message: string, status?: number, data?: any) {
    super(message)
    this.name = 'AuthNetworkError'
    this.status = status
    this.data = data
  }
}

export class AuthService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || ''
  private static readonly LOG_PREFIX = '[AuthService]'
  private static readonly DEBUG_ENABLED = process.env.NODE_ENV === 'development'

  // Configuración de timeouts simplificada
  private static readonly DEFAULT_TIMEOUT = 15000

  /**
   * Internal method for consistent logging
   */
  private static log(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...data: any[]) {
    const timestamp = new Date().toISOString()
    const prefix = `${timestamp} ${this.LOG_PREFIX}`

    switch (level) {
      case 'info':
        console.info(`${prefix} ${message}`, ...data)
        break
      case 'warn':
        console.warn(`${prefix} ${message}`, ...data)
        break
      case 'error':
        console.error(`${prefix} ${message}`, ...data)
        break
      case 'debug':
        if (this.DEBUG_ENABLED) {
          console.debug(`${prefix} ${message}`, ...data)
        }
        break
    }
  }

  /**
   * Validates API URL before making any request
   * @throws AuthServiceError if API URL is not configured
   */
  private static validateApiUrl(): string {
    if (!this.API_URL) {
      this.log('error', 'API URL is not configured. Set PUBLIC_API_URL environment variable.')
      throw new AuthServiceError('API URL is not configured. Contact administrator.')
    }
    return this.API_URL
  }

  /**
   * Gets the active roles with their permissions for the current authenticated user
   * @returns Promise resolving to an array of roles with their permissions
   * @throws AuthServiceError if the request fails
   */
  static async getUserActiveRoles(): Promise<UserRolesResponse[]> {
    this.log('info', 'Fetching active roles for current user')

    try {
      const apiUrl = this.validateApiUrl()

      this.log('debug', `Making request to ${apiUrl}/users/me/roles/active`)
      const response = await HttpClient.get(`${apiUrl}/users/me/roles/active`, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const roles = response.data.data || []

      if (!Array.isArray(roles)) {
        this.log('error', 'Unexpected response format, expected an array of roles')
        throw new AuthServiceError('Formato de respuesta inesperado del servidor')
      }

      this.log('info', `Successfully retrieved ${roles.length} active roles`)
      return roles
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status

      this.log('error', 'Error fetching user roles:', {
        status: statusCode,
        message: axiosError.message
      })

      // Simplificar manejo de errores
      if (statusCode === 401) {
        throw new AuthNetworkError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', statusCode)
      }

      if (statusCode === 403) {
        throw new AuthNetworkError('No tienes permisos para acceder a la información de roles.', statusCode)
      }

      if (statusCode === 404) {
        throw new AuthNetworkError('No se encontraron roles disponibles para tu usuario.', statusCode)
      }

      // Error genérico para otros casos
      throw new AuthNetworkError('Error al obtener roles. Intenta nuevamente.', statusCode)
    }
  }

  /**
   * Validates if user is authenticated by checking session
   */
  static async validateSession(): Promise<boolean> {
    try {
      const apiUrl = this.validateApiUrl()
      const response = await HttpClient.get(`${apiUrl}/auth/me`, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      })
      // Aceptar tanto 200 como 304 como respuestas válidas
      const isValid = response.status === 200 || response.status === 304
      this.log('debug', `Session validation result: ${isValid} (status: ${response.status})`)
      return isValid
    } catch (error) {
      this.log('debug', 'Session validation failed:', error)
      return false
    }
  }

  /**
   * Logout user and clear session
   */
  static async logout(): Promise<void> {
    this.log('info', 'Logging out user')

    try {
      const apiUrl = this.validateApiUrl()
      await HttpClient.get(`${apiUrl}/auth/logout`, {
        timeout: this.DEFAULT_TIMEOUT
      })
      this.log('info', 'Logout successful on server')
    } catch (error) {
      this.log('warn', 'Logout request failed, but continuing with local cleanup:', error)
    }
  }

  /**
   * Get current user profile with enhanced logging and validation
   * @returns Promise resolving to user profile data
   * @throws AuthServiceError if the request fails
   */
  static async getUserProfile(): Promise<UserProfile> {
    const timestamp = new Date().toISOString()
    this.log('info', `[${timestamp}] 📡 Iniciando obtención de perfil de usuario`)

    try {
      const apiUrl = this.validateApiUrl()
      this.log('debug', `[${timestamp}] 🌐 Haciendo solicitud a: ${apiUrl}/auth/me`)

      // Log inicial para debugging crítico
      if (typeof window !== 'undefined' && window.console) {
        window.console.group(`🔍 [${timestamp}] AuthService.getUserProfile - DEBUGGING COMPLETO`)
        window.console.log('🚀 Iniciando solicitud HTTP...')
      }

      const response = await HttpClient.get(`${apiUrl}/auth/me`, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      })

      // Logging exhaustivo de la respuesta HTTP completa
      this.log('debug', `[${timestamp}] 📊 Respuesta HTTP completa recibida`)
      if (typeof window !== 'undefined' && window.console) {
        window.console.log('📊 Response Status:', response.status)
        window.console.log('📊 Response StatusText:', response.statusText)
        window.console.log('📊 Response Headers:', response.headers)
        window.console.log('📊 Response Config:', response.config)
        window.console.log('📊 Response Data (RAW):', response.data)
        window.console.log('📊 Response Data Type:', typeof response.data)
        window.console.log('� Response Data Constructor:', response.data?.constructor?.name)
        window.console.log('📊 Response Data toString():', String(response.data))
      }

      // Verificar que la respuesta sea válida
      if (!response.data) {
        const errorMsg = 'Respuesta HTTP vacía o nula'
        this.log('error', `[${timestamp}] ❌ ${errorMsg}`)
        if (typeof window !== 'undefined' && window.console) {
          window.console.error('❌ Response.data es:', response.data)
          window.console.groupEnd()
        }
        throw new AuthServiceError(errorMsg)
      }

      // Análisis profundo de la estructura de response.data
      let profileData = response.data
      if (typeof window !== 'undefined' && window.console) {
        window.console.group('🔍 Análisis de estructura de datos')
        window.console.log('📦 response.data:', response.data)
        window.console.log('📦 typeof response.data:', typeof response.data)
        window.console.log('📦 Array.isArray(response.data):', Array.isArray(response.data))

        if (response.data && typeof response.data === 'object') {
          const keys = Object.keys(response.data)
          window.console.log('📦 Object.keys(response.data):', keys)
          window.console.log('📦 Object.hasOwnProperty("data"):', response.data.hasOwnProperty('data'))
          window.console.log('📦 "data" in response.data:', 'data' in response.data)

          // Mostrar cada propiedad individualmente
          keys.forEach((key) => {
            window.console.log(`📦 response.data["${key}"]:`), response.data[key], `(tipo: ${typeof response.data[key]})`
          })
        }
        window.console.groupEnd()
      }

      // Determinar si necesitamos extraer datos anidados
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        profileData = response.data.data
        this.log('debug', `[${timestamp}] 📦 Extrayendo datos desde response.data.data`)
        if (typeof window !== 'undefined' && window.console) {
          window.console.log('📦 Usando response.data.data:', profileData)
        }
      } else {
        this.log('debug', `[${timestamp}] 📦 Usando response.data directamente`)
        if (typeof window !== 'undefined' && window.console) {
          window.console.log('📦 Usando response.data directamente:', profileData)
        }
      }

      // Validación de datos con logging mejorado
      if (typeof window !== 'undefined' && window.console) {
        window.console.group('🔍 Validación de datos de perfil')
        window.console.log('📊 profileData final para validación:', profileData)
        window.console.log('📊 typeof profileData:', typeof profileData)

        if (profileData && typeof profileData === 'object') {
          const profileKeys = Object.keys(profileData)
          window.console.log('📊 Claves de profileData:', profileKeys)

          // Verificar campos requeridos específicamente
          const requiredFields = ['id', 'email', 'name']
          requiredFields.forEach((field) => {
            const value = profileData[field]
            const hasField = field in profileData
            const isValidString = typeof value === 'string' && value.trim() !== ''

            window.console.log(`📊 Campo "${field}":`, {
              presente: hasField,
              valor: value,
              tipo: typeof value,
              esStringValido: isValidString,
              length: typeof value === 'string' ? value.length : 'N/A'
            })
          })
        }
        window.console.groupEnd()
      }

      try {
        this.validateProfileData(profileData, timestamp)
        this.log('info', `[${timestamp}] ✅ Perfil validado correctamente`)

        if (typeof window !== 'undefined' && window.console) {
          window.console.log('✅ Validación exitosa, datos finales:', profileData)
          window.console.groupEnd()
        }

        return profileData
      } catch (validationError) {
        this.log('error', `[${timestamp}] ❌ Error en validación:`, validationError)

        if (typeof window !== 'undefined' && window.console) {
          window.console.error('❌ Error en validación:', validationError)
          window.console.error('❌ Datos que causaron el error:', profileData)
          window.console.groupEnd()
        }

        throw validationError
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('💥 Error en getUserProfile:', error)
        window.console.groupEnd()
      }

      if (error instanceof AuthServiceError) {
        this.log('error', `[${timestamp}] ❌ Error de validación:`, error.message)
        throw error
      }

      const axiosError = error as any
      const statusCode = axiosError?.response?.status || 'UNKNOWN'
      const errorMessage = axiosError?.message || 'Error desconocido'

      this.log('error', `[${timestamp}] ❌ Error de red:`, {
        status: statusCode,
        message: errorMessage,
        data: axiosError?.response?.data,
        url: axiosError?.config?.url
      })

      throw new AuthServiceError(`Error al obtener el perfil del usuario (${statusCode}): ${errorMessage}`)
    }
  }

  /**
   * Validate the structure of profile data received from backend
   * @private
   */
  private static validateProfileData(data: any, timestamp: string): void {
    // Logging inicial con grupo organizado
    if (typeof window !== 'undefined' && window.console) {
      window.console.group(`🔍 [validateProfileData] Validación de datos de perfil`)
      window.console.log('📊 Datos recibidos para validación:', data)
      window.console.log('� Tipo de datos:', typeof data)
      window.console.log('📊 Constructor:', data?.constructor?.name)
      window.console.log('� Es null:', data === null)
      window.console.log('📊 Es undefined:', data === undefined)
      window.console.log('� Es array:', Array.isArray(data))
    }

    // Validación 1: Verificar que data no sea null/undefined/primitivo
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      const errorMsg = `Los datos del perfil son inválidos: tipo=${typeof data}, valor=${JSON.stringify(data)}`
      this.log('error', `[${timestamp}] ❌ ${errorMsg}`)

      if (typeof window !== 'undefined' && window.console) {
        window.console.error('❌ Datos inválidos:', {
          data,
          tipo: typeof data,
          esArray: Array.isArray(data),
          esNull: data === null,
          esUndefined: data === undefined
        })
        window.console.groupEnd()
      }

      throw new AuthServiceError(errorMsg)
    }

    // Logging de estructura del objeto
    if (typeof window !== 'undefined' && window.console) {
      const keys = Object.keys(data)
      window.console.log('📊 Claves del objeto:', keys)
      window.console.log('📊 Número de propiedades:', keys.length)

      // Mostrar cada propiedad en detalle
      keys.forEach((key) => {
        const value = data[key]
        window.console.log(`📊 Propiedad "${key}":`, {
          valor: value,
          tipo: typeof value,
          esString: typeof value === 'string',
          esStringVacio: typeof value === 'string' && value.trim() === '',
          longitud: typeof value === 'string' ? value.length : 'N/A'
        })
      })
    }

    // Validación 2: Verificar campos requeridos
    const requiredFields = ['id', 'email', 'name']
    const missingFields: string[] = []
    const fieldDetails: any = {}

    for (const field of requiredFields) {
      const value = data[field]
      const exists = field in data
      const isString = typeof value === 'string'
      const isNonEmpty = isString && value.trim() !== ''

      fieldDetails[field] = {
        existe: exists,
        valor: value,
        tipo: typeof value,
        esString: isString,
        noVacio: isNonEmpty,
        valido: exists && isString && isNonEmpty
      }

      if (!exists || !isString || !isNonEmpty) {
        missingFields.push(`${field} (presente:${exists}, tipo:${typeof value}, valor:"${value}")`)

        this.log('error', `[${timestamp}] ❌ Campo inválido: ${field}`, fieldDetails[field])

        if (typeof window !== 'undefined' && window.console) {
          window.console.error(`❌ Campo inválido: ${field}`, fieldDetails[field])
        }
      } else {
        this.log('debug', `[${timestamp}] ✅ Campo válido: ${field}`, fieldDetails[field])

        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`✅ Campo válido: ${field}`, fieldDetails[field])
        }
      }
    }

    // Si faltan campos, reportar error detallado
    if (missingFields.length > 0) {
      const errorMsg = `Datos de perfil incompletos. Campos problemáticos: ${missingFields.join(', ')}`
      this.log('error', `[${timestamp}] ❌ ${errorMsg}`)

      if (typeof window !== 'undefined' && window.console) {
        window.console.error('❌ Resumen de validación:', {
          camposRequeridos: requiredFields,
          camposFaltantes: missingFields,
          detallesDeCampos: fieldDetails,
          datosCompletos: data
        })
        window.console.groupEnd()
      }

      throw new AuthServiceError(errorMsg)
    }

    // Validación 3: Formato de email
    const emailValue = data.email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      const errorMsg = `Email inválido: "${emailValue}"`
      this.log('error', `[${timestamp}] ❌ ${errorMsg}`)

      if (typeof window !== 'undefined' && window.console) {
        window.console.error('❌ Email inválido:', {
          email: emailValue,
          regex: emailRegex.toString(),
          prueba: emailRegex.test(emailValue)
        })
        window.console.groupEnd()
      }

      throw new AuthServiceError(errorMsg)
    }

    // Validación exitosa
    this.log('debug', `[${timestamp}] ✅ Validación exitosa para todos los campos`)

    if (typeof window !== 'undefined' && window.console) {
      window.console.log('✅ Validación exitosa:', {
        camposValidados: requiredFields,
        datosValidados: {
          id: data.id,
          email: data.email,
          name: data.name
        }
      })
      window.console.groupEnd()
    }
  }

  /**
   * Refresh access token automatically
   * @returns Promise resolving to boolean indicating success
   */
  static async refreshToken(): Promise<boolean> {
    this.log('info', 'Attempting to refresh access token')

    try {
      const apiUrl = this.validateApiUrl()

      const response = await HttpClient.post(
        `${apiUrl}/auth/refresh`,
        {},
        {
          timeout: this.DEFAULT_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      this.log('info', 'Access token refreshed successfully')
      return response.status === 200
    } catch (error) {
      const axiosError = error as AxiosError
      this.log('error', 'Error refreshing token:', {
        status: axiosError.response?.status,
        message: axiosError.message
      })
      return false
    }
  }

  /**
   * Complete user profile (PRE_REGISTRATION -> ACTIVE)
   * @param profileData - Profile completion data
   * @returns Promise resolving to updated user profile
   * @throws AuthServiceError if the request fails
   */
  static async completeProfile(profileData: any): Promise<UserProfile> {
    this.log('info', 'Completing user profile')

    try {
      const apiUrl = this.validateApiUrl()

      const response = await HttpClient.post(`${apiUrl}/auth/complete-profile`, profileData, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.log('info', 'Profile completed successfully')
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status

      this.log('error', 'Error completing profile:', {
        status: statusCode,
        message: axiosError.message
      })

      if (statusCode === 401) {
        throw new AuthServiceError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      }

      if (statusCode === 400) {
        throw new AuthServiceError('Datos de perfil inválidos. Verifica la información.')
      }

      throw new AuthServiceError('Error al completar el perfil del usuario')
    }
  }
}
