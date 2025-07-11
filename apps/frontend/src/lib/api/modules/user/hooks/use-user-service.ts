import {
  ChangeUserStatusDto,
  CreateUserDto,
  MeUpdateUserDto,
  UpdateUserDto,
  UserFilters
} from '@/lib/api/modules/user/user.types'
import { UserStatus } from '@una-gc/database/prisma/generated/client'
import { useCallback } from 'react'
import { userApiService } from '../user-api.service'
import { useUserStore } from '../user.store'

/**
 * Hook para gestionar el servicio de usuarios con acceso correcto al store
 */
export function useUserService() {
  const store = useUserStore()

  // Obtener usuarios con paginación y filtros
  const getUsers = useCallback(
    async (params: UserFilters & { page?: number; limit?: number } = {}) => {
      try {
        store.setLoading(true)
        store.clearErrors()

        const response = await userApiService.findAll(params)
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
    },
    [store]
  )

  // Obtener usuario por ID
  const getUserById = useCallback(
    async (id: string, include?: string) => {
      try {
        store.setLoadingItem(true)
        store.clearErrors()

        const user = await userApiService.findById(id, include)
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
    },
    [store]
  )

  // Crear usuario
  const createUser = useCallback(
    async (userData: CreateUserDto) => {
      try {
        store.setCreating(true)
        store.clearErrors()

        const newUser = await userApiService.create(userData)
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
    },
    [store]
  )

  // Actualizar usuario
  const updateUser = useCallback(
    async (id: string, userData: UpdateUserDto) => {
      try {
        store.setUpdating(true)
        store.clearErrors()

        const updatedUser = await userApiService.update(id, userData)
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
    },
    [store]
  )

  // Actualizar perfil de usuario
  const updateUserProfile = useCallback(
    async (id: string, userData: UpdateUserDto) => {
      try {
        store.setUpdating(true)
        store.clearErrors()

        const updatedUser = await userApiService.updateProfile(id, userData)
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
    },
    [store]
  )

  // Eliminar usuario (soft delete)
  const deleteUser = useCallback(
    async (id: string) => {
      try {
        store.setDeleting(true)
        store.clearErrors()

        await userApiService.softDelete(id)
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
    },
    [store]
  )

  // Asignar roles a usuario
  const setUserRoles = useCallback(
    async (id: string, roleIds: string[]) => {
      try {
        store.setUpdating(true)
        store.clearErrors()

        const updatedUser = await userApiService.setUserRoles(id, { roleIds })
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
    },
    [store]
  )

  // Obtener roles de usuario
  const getUserRoles = useCallback(async (id: string) => {
    try {
      return await userApiService.getAllUserRoles(id)
    } catch (error) {
      throw error
    }
  }, [])

  // Obtener usuario actual
  const getCurrentUser = useCallback(async () => {
    try {
      return await userApiService.getCurrentUser()
    } catch (error) {
      throw error
    }
  }, [])

  // Actualizar usuario actual
  const updateCurrentUser = useCallback(async (userData: MeUpdateUserDto) => {
    try {
      return await userApiService.updateCurrentUser(userData)
    } catch (error) {
      throw error
    }
  }, [])

  // Contar usuarios
  const countUsers = useCallback(async (where?: any) => {
    try {
      return await userApiService.count(where)
    } catch (error) {
      throw error
    }
  }, [])

  // Obtener todos los roles disponibles
  const getAllRoles = useCallback(async () => {
    try {
      return await userApiService.getAllRoles()
    } catch (error) {
      throw error
    }
  }, [])

  // Cambiar estado de usuario
  const changeUserStatus = useCallback(
    async (id: string, status: UserStatus) => {
      try {
        store.setUpdating(true)
        store.clearErrors()

        const changeUserStatusDto: ChangeUserStatusDto = { status }
        const updatedUser = await userApiService.changeUserStatus(id, changeUserStatusDto)
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
    },
    [store]
  )

  // Archivar usuario (cambiar estado a INACTIVE)
  const archiveUser = useCallback(
    async (id: string) => {
      return changeUserStatus(id, UserStatus.INACTIVE)
    },
    [changeUserStatus]
  )

  // Reactivar usuario (cambiar estado a ACTIVE)
  const reactivateUser = useCallback(
    async (id: string) => {
      return changeUserStatus(id, UserStatus.ACTIVE)
    },
    [changeUserStatus]
  )

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserProfile,
    deleteUser,
    setUserRoles,
    getUserRoles,
    getCurrentUser,
    updateCurrentUser,
    countUsers,
    getAllRoles,
    changeUserStatus,
    archiveUser,
    reactivateUser
  }
}
