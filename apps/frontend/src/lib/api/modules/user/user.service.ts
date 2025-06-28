import {
  ChangeUserStatusDto,
  CreateUserDto,
  MeUpdateUserDto,
  UpdateUserDto,
  UserFilters
} from '@/lib/api/modules/user/user.types'
import { UserStatus } from '@una-gc/database/prisma/generated/client'
import { userApiService } from './user-api.service'
import { useUserBaseStore } from './user.store'

// Clase de servicio que conecta API con Store (similar al patrón del backend)
export class UserService {
  constructor(private apiService = userApiService) {}

  // Helper method to get store (this will be called from React components/hooks context)
  private getStore() {
    return useUserBaseStore()
  }

  // Obtener usuarios con paginación y filtros
  async getUsers(params: UserFilters & { page?: number; limit?: number } = {}) {
    const store = this.getStore()
    try {
      store.setLoading(true)
      store.clearErrors()

      const response = await this.apiService.findAll(params)
      store.setItems(response)

      return response
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error fetching users',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  // Obtener usuario por ID
  async getUserById(id: string, include?: string) {
    const store = this.getStore()
    try {
      store.setLoadingItem(true)
      store.clearErrors()

      const user = await this.apiService.findById(id, include)
      store.setSelectedItem(user)

      return user
    } catch (error: any) {
      store.setItemError({
        message: error.message || 'Error fetching user',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setLoadingItem(false)
    }
  }

  // Crear usuario
  async createUser(userData: CreateUserDto) {
    const store = this.getStore()
    try {
      store.setCreating(true)
      store.clearErrors()

      const newUser = await this.apiService.create(userData)
      store.addItem(newUser)

      return newUser
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error creating user',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setCreating(false)
    }
  }

  // Actualizar usuario
  async updateUser(id: string, userData: UpdateUserDto) {
    const store = this.getStore()
    try {
      store.setUpdating(true)
      store.clearErrors()

      const updatedUser = await this.apiService.update(id, userData)
      store.updateItem(updatedUser)

      return updatedUser
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error updating user',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setUpdating(false)
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(id: string, userData: UpdateUserDto) {
    const store = this.getStore()
    try {
      store.setUpdating(true)
      store.clearErrors()

      const updatedUser = await this.apiService.updateProfile(id, userData)
      store.updateItem(updatedUser)

      return updatedUser
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error updating user profile',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setUpdating(false)
    }
  }

  // Eliminar usuario (soft delete)
  async deleteUser(id: string) {
    const store = this.getStore()
    try {
      store.setDeleting(true)
      store.clearErrors()

      await this.apiService.softDelete(id)
      store.removeItem(id)
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error deleting user',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setDeleting(false)
    }
  }

  // Asignar roles a usuario
  async setUserRoles(id: string, roleIds: string[]) {
    const store = this.getStore()
    try {
      store.setUpdating(true)
      store.clearErrors()

      const updatedUser = await this.apiService.setUserRoles(id, { roleIds })
      store.updateItem(updatedUser)

      return updatedUser
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error setting user roles',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setUpdating(false)
    }
  }

  // Obtener roles de usuario
  async getUserRoles(id: string) {
    try {
      return await this.apiService.getAllUserRoles(id)
    } catch (error) {
      throw error
    }
  }

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      return await this.apiService.getCurrentUser()
    } catch (error) {
      throw error
    }
  }

  // Actualizar usuario actual
  async updateCurrentUser(userData: MeUpdateUserDto) {
    try {
      return await this.apiService.updateCurrentUser(userData)
    } catch (error) {
      throw error
    }
  }

  // Contar usuarios
  async countUsers(where?: any) {
    try {
      return await this.apiService.count(where)
    } catch (error) {
      throw error
    }
  }

  // Obtener todos los roles disponibles
  async getAllRoles() {
    try {
      return await this.apiService.getAllRoles()
    } catch (error) {
      throw error
    }
  }

  // Cambiar estado de usuario
  async changeUserStatus(id: string, status: UserStatus) {
    const store = this.getStore()
    try {
      store.setUpdating(true)
      store.clearErrors()

      const changeUserStatusDto: ChangeUserStatusDto = { status }
      const updatedUser = await this.apiService.changeUserStatus(id, changeUserStatusDto)
      store.updateItem(updatedUser)

      return updatedUser
    } catch (error: any) {
      store.setError({
        message: error.message || 'Error changing user status',
        statusCode: error.status || 500,
        error: error.name || 'UnknownError'
      })
      throw error
    } finally {
      store.setUpdating(false)
    }
  }

  // Archivar usuario (cambiar estado a INACTIVE)
  async archiveUser(id: string) {
    return this.changeUserStatus(id, UserStatus.INACTIVE)
  }

  // Reactivar usuario (cambiar estado a ACTIVE)
  async reactivateUser(id: string) {
    return this.changeUserStatus(id, UserStatus.ACTIVE)
  }
}

// NOTE: This singleton export is deprecated and should not be used.
// Use the useUserService hook instead for proper React hook compliance.
// This is kept temporarily for backward compatibility.
export const userService = new UserService()
