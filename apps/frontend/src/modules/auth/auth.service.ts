import axios, { AxiosError } from 'axios'
import { UserRolesResponse } from './interfaces'

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
   *
   * @returns Promise resolving to an array of roles with their permissions
   * @throws AuthServiceError if the request fails
   */
  static async getUserActiveRoles(): Promise<UserRolesResponse[]> {
    this.log('info', 'Fetching active roles for current user')

    try {
      const apiUrl = this.validateApiUrl()

      this.log('debug', `Making request to ${apiUrl}/users/me/roles/active`)
      const response = await axios.get(`${apiUrl}/users/me/roles/active`, {
        withCredentials: true,
        timeout: 10000, // 10 segundos timeout
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.log('debug', 'Raw response data:', JSON.stringify(response.data).substring(0, 200) + '...')

      // Just extract the roles directly from response.data.data
      const roles = response.data.data || []

      if (!Array.isArray(roles)) {
        this.log('error', 'Unexpected response format, expected an array of roles')
        throw new AuthServiceError('Unexpected response format from server')
      }

      this.log('info', `Successfully retrieved ${roles.length} active roles`)
      return roles
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status
      const responseData = axiosError.response?.data

      this.log('error', 'Error fetching user roles:', {
        status: statusCode,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        data: responseData,
        code: axiosError.code
      })

      // Errores de conexión/red
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND' || axiosError.code === 'ETIMEDOUT') {
        throw new AuthNetworkError(
          'No se puede conectar al servidor de autenticación. Verifica tu conexión de red.',
          statusCode,
          responseData
        )
      }

      // Timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new AuthNetworkError('La solicitud ha excedido el tiempo límite. Intenta nuevamente.', statusCode, responseData)
      }

      // Errores específicos por código de estado
      switch (statusCode) {
        case 401:
          throw new AuthNetworkError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', statusCode, responseData)
        case 403:
          throw new AuthNetworkError('No tienes permisos para acceder a la información de roles.', statusCode, responseData)
        case 404:
          throw new AuthNetworkError('No se encontraron roles disponibles para tu usuario.', statusCode, responseData)
        case 500:
          const serverMessage = (responseData as any)?.message || 'Error interno del servidor'
          throw new AuthNetworkError(
            `Error del servidor: ${serverMessage}. Si el problema persiste, contacta soporte.`,
            statusCode,
            responseData
          )
        case 502:
        case 503:
        case 504:
          throw new AuthNetworkError('El servicio no está disponible temporalmente. Intenta más tarde.', statusCode, responseData)
        default:
          const defaultMessage = (responseData as any)?.message || axiosError.message || 'Error desconocido'
          throw new AuthNetworkError(`Error al obtener roles: ${defaultMessage}`, statusCode, responseData)
      }
    }
  }

  /**
   * Validates if user is authenticated by checking session
   */
  static async validateSession(): Promise<boolean> {
    try {
      const apiUrl = this.validateApiUrl()
      const response = await axios.get(`${apiUrl}/auth/me`, {
        withCredentials: true,
        timeout: 5000
      })
      return response.status === 200
    } catch (error) {
      this.log('debug', 'Session validation failed:', error)
      return false
    }
  }

  /**
   * Logout user and clear session
   */
  static async logout(): Promise<void> {
    try {
      const apiUrl = this.validateApiUrl()
      await axios.post(
        `${apiUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
          timeout: 5000
        }
      )
    } catch (error) {
      this.log('warn', 'Logout request failed, but continuing with local cleanup:', error)
    }
  }
}
