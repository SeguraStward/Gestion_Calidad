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

      this.log('debug', 'Raw response data:',
        JSON.stringify(response.data).substring(0, 200) + '...')

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
              // Mantener campos adicionales que puedan ser útiles
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
        throw new AuthNetworkError('Cannot connect to authentication server. Check your network connection.',
          statusCode, responseData)
      }

      if (statusCode === 401) {
        throw new AuthNetworkError('Your session has expired. Please log in again.',
          statusCode, responseData)
      }

      if (statusCode === 403) {
        throw new AuthNetworkError('You don\'t have permission to access role information.',
          statusCode, responseData)
      }

      throw new AuthNetworkError(
        `Failed to fetch roles: ${axiosError.message}`,
        statusCode,
        responseData
      )
    }
  }

  /**
   * Cambia el rol activo del usuario autenticado.
   *
   * @param roleId ID del rol al que se desea cambiar.
   * @returns Promesa que resuelve con la respuesta del cambio de rol.
   * @throws AuthServiceError si el cambio de rol falla.
   */
  static async changeRole(roleId: string): Promise<SwitchRoleResponse> {
    this.log('info', `Switching to role with ID: ${roleId}`)

    if (!roleId) {
      const error = 'Role ID is required'
      this.log('error', error)
      throw new AuthServiceError(error)
    }

    try {
      const apiUrl = this.validateApiUrl()

      this.log('debug', `Making request to ${apiUrl}/auth/change-role with roleId: ${roleId}`)

      // El endpoint espera un objeto con la propiedad roleId
      const response = await axios.post<{
        id: string
        email: string
        fullName: string
        fullLastName: string
        profilePicture: string
        role: {
          id: string
          name: string
          description: string
          permissions: Array<any>
        }
      }>(
        `${apiUrl}/auth/change-role`,
        { roleId },
        { withCredentials: true } // Important for cookies
      )

      // Transformar la respuesta del backend al formato SwitchRoleResponse
      const switchRoleResponse: SwitchRoleResponse = {
        user: {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          fullLastName: response.data.fullLastName,
          profilePicture: response.data.profilePicture,
          role: response.data.role
        },
        token: '' // Ya no se necesita el token, se maneja con cookies
      }

      this.log('info', `Successfully switched to role: ${roleId}`)
      this.log('debug', 'Role switch response:', switchRoleResponse)

      return switchRoleResponse
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status
      const responseData = axiosError.response?.data as any

      this.log('error', `Error switching role:`, {
        roleId,
        status: statusCode,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        responseData: responseData
      })

      // Handle specific error cases
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        throw new AuthNetworkError(
          'Cannot connect to authentication server. Check your network connection.',
          statusCode,
          responseData
        )
      }

      if (statusCode === 401) {
        throw new AuthNetworkError(
          'Authentication required. Please login again.',
          statusCode,
          responseData
        )
      }

      if (statusCode === 403) {
        throw new AuthNetworkError(
          'You do not have permission to switch to this role.',
          statusCode,
          responseData
        )
      }

      if (statusCode === 404) {
        throw new AuthNetworkError(
          `Role with ID ${roleId} was not found.`,
          statusCode,
          responseData
        )
      }

      // Use server error message if available
      const errorMessage = responseData?.message || axiosError.message || 'Unknown error occurred'
      throw new AuthNetworkError(
        `Failed to switch role: ${errorMessage}`,
        statusCode,
        responseData
      )
    }
  }
}