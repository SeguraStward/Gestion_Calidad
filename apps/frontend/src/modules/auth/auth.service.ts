import axios, { AxiosError } from 'axios'

// Type definitions
export interface Permission {
  id: string
  name: string
  code: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: Permission[]
}

export interface SwitchRoleResponse {
  user: {
    id: string
    email: string
    fullName: string
    fullLastName: string
    profilePicture: string
    role: {
      id: string
      name: string
      description: string
      permissions: Array<{
        permissionID: string
        permissions: string[]
        scope: string | null
        actions: string[]
      }>
    }
  }
  token: string
}

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
  static async getUserActiveRoles(): Promise<Role[]> {
    this.log('info', 'Fetching active roles for current user')

    try {
      const apiUrl = this.validateApiUrl()

      this.log('debug', `Making request to ${apiUrl}/users/me/roles/active`)
      const response = await axios.get(`${apiUrl}/users/me/roles/active`, {
        withCredentials: true
      })

      this.log('debug', 'Raw response data:', JSON.stringify(response.data).substring(0, 200) + '...')

      // Verificar formato de respuesta y normalizar
      let normalizedRoles: Role[] = []

      if (Array.isArray(response.data)) {
        normalizedRoles = response.data.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: Array.isArray(role.permissions)
            ? role.permissions.map((perm: any) => ({
                id: perm.id,
                name: perm.name,
                code: perm.code,
                description: perm.description || '',
                status: perm.status,
                type: perm.type,
                scope: perm.scope,
                actions: perm.actions
              }))
            : []
        }))
      } else if (response.data && typeof response.data === 'object') {
        this.log('warn', 'Unexpected response format:', response.data)

        // Intentar extraer roles de otras posibles estructuras
        if (response.data.roles && Array.isArray(response.data.roles)) {
          normalizedRoles = response.data.roles
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Algunos APIs anidan los resultados en un campo 'data'
          normalizedRoles = response.data.data
        } else {
          this.log('warn', 'Could not extract roles from response, returning empty array')
        }
      }

      this.log('info', `Successfully retrieved ${normalizedRoles.length} active roles`)
      return normalizedRoles
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status
      const responseData = axiosError.response?.data

      this.log('error', 'Error fetching user roles:', {
        status: statusCode,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        data: responseData
      })

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        throw new AuthNetworkError(
          'Cannot connect to authentication server. Check your network connection.',
          statusCode,
          responseData
        )
      }

      if (statusCode === 401) {
        throw new AuthNetworkError('Your session has expired. Please log in again.', statusCode, responseData)
      }

      if (statusCode === 403) {
        throw new AuthNetworkError("You don't have permission to access role information.", statusCode, responseData)
      }

      throw new AuthNetworkError(`Failed to fetch roles: ${axiosError.message}`, statusCode, responseData)
    }
  }
}
