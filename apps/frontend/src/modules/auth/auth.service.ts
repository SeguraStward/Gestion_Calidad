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
  success: boolean
}

export class AuthService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL
  private static readonly LOG_PREFIX = '[UserService]'

  /**
   * Gets the active roles with their permissions for the current authenticated user
   *
   * @returns Promise resolving to an array of roles with their permissions
   * @throws Error if the request fails
   */
  static async getUserActiveRoles(): Promise<Role[]> {
    console.log(`${this.LOG_PREFIX} Fetching active roles for current user`)

    try {
      const response = await axios.get(`${this.API_URL}/users/me/roles/active`, {
        withCredentials: true
      })

      console.log(`${this.LOG_PREFIX} Raw response data:`, JSON.stringify(response.data).substring(0, 200) + '...')

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
                description: perm.description || '', // Manejar ausencia de description
                // Mantener campos adicionales que puedan ser útiles
                status: perm.status,
                type: perm.type,
                scope: perm.scope,
                actions: perm.actions
              }))
            : []
        }))
      } else if (response.data && typeof response.data === 'object') {
        console.warn(`${this.LOG_PREFIX} Unexpected response format:`, response.data)

        // Intentar extraer roles de otras posibles estructuras
        if (response.data.roles && Array.isArray(response.data.roles)) {
          normalizedRoles = response.data.roles
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Algunos APIs anidan los resultados en un campo 'data'
          normalizedRoles = response.data.data
        } else {
          console.warn(`${this.LOG_PREFIX} Could not extract roles from response, returning empty array`)
        }
      }

      console.log(`${this.LOG_PREFIX} Successfully retrieved ${normalizedRoles.length} active roles`)
      return normalizedRoles
    } catch (error) {
      const axiosError = error as AxiosError
      console.error(`${this.LOG_PREFIX} Error fetching user roles:`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        data: axiosError.response?.data
      })
      throw error // Propaga el error para que page.tsx pueda manejarlo
    }
  }

  /**
   * Switch the user's active role
   *
   * @param roleId The ID of the role to switch to
   * @returns Promise resolving to a success response
   * @throws Error if the role switch fails
   */
  static async switchRole(roleId: string): Promise<SwitchRoleResponse> {
    console.log(`${this.LOG_PREFIX} Switching to role with ID: ${roleId}`)

    if (!roleId) {
      const error = 'Role ID is required'
      console.error(`${this.LOG_PREFIX} ${error}`)
      throw new Error(error)
    }

    try {
      // This endpoint matches what's defined in auth.controller.ts
      const response = await axios.post<SwitchRoleResponse>(
        `${this.API_URL}/auth/switch-role`,
        { roleId },
        { withCredentials: true } // Important for cookies
      )

      console.log(`${this.LOG_PREFIX} Successfully switched to role: ${roleId}`)
      return { success: true }
    } catch (error) {
      const axiosError = error as AxiosError
      const statusCode = axiosError.response?.status
      const responseData = axiosError.response?.data as any

      // Handle specific error cases
      if (statusCode === 401) {
        console.error(`${this.LOG_PREFIX} Unauthorized: User not authenticated or session expired`)
        throw new Error('Authentication required. Please login again.')
      } else if (statusCode === 403) {
        console.error(`${this.LOG_PREFIX} Forbidden: User does not have access to this role`)
        throw new Error('You do not have permission to switch to this role')
      }

      console.error(`${this.LOG_PREFIX} Error switching role:`, {
        roleId,
        status: statusCode,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        responseData: responseData
      })

      // Use server error message if available
      const errorMessage = responseData?.message || axiosError.message || 'Unknown error occurred'
      throw new Error(`Failed to switch role: ${errorMessage}`)
    }
  }

  /**
   * Check if user has a specific permission
   *
   * @param roles User's active roles
   * @param permissionCode The permission code to check
   * @returns Boolean indicating if the user has the permission
   */
  static hasPermission(roles: Role[], permissionCode: string): boolean {
    if (!roles?.length || !permissionCode) {
      return false
    }

    return roles.some((role) => role.permissions?.some((permission) => permission.code === permissionCode))
  }
}
