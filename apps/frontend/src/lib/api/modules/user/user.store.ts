import { createBaseEntityStore } from '@/lib/api/stores/base-entity.store'
import { UserStatus } from '@una-gc/database/prisma/generated/client'
import { CreateUserDto, UpdateUserDto, UserDto } from './user.types'

// Filtros por defecto para usuarios (solo activos)src\lib\api\stores\base-entity.store.ts
const DEFAULT_USER_FILTERS = {
  status: UserStatus.ACTIVE,
  limit: 10,
  page: 1
}

// Store específico para usuarios con configuraciones optimizadas
export const useUserStore = createBaseEntityStore<UserDto, CreateUserDto, UpdateUserDto>('users', DEFAULT_USER_FILTERS)

// Selector para obtener solo usuarios activos
export const useActiveUsers = () => {
  const store = useUserStore()
  return {
    ...store,
    items: store.items.filter((user) => user.status === UserStatus.ACTIVE)
  }
}

// Selector para obtener usuarios archivados (inactivos)
export const useArchivedUsers = () => {
  const store = useUserStore()
  return {
    ...store,
    items: store.items.filter((user) => user.status === UserStatus.INACTIVE)
  }
}

// Selector para buscar por cédula específicamente
export const useUserByCedula = (cedula: string) => {
  const store = useUserStore()
  return store.items.find((user) => user.nationalId === cedula) || null
}

// Acciones específicas para usuarios
export const userStoreActions = {
  // Filtrar por estado de usuario
  filterByStatus: (status: UserStatus) => {
    useUserStore.getState().updateFilter('status', status)
    useUserStore.getState().setPage(1) // Reset a primera página
  },

  // Buscar por cédula
  searchByCedula: (cedula: string) => {
    useUserStore.getState().updateFilter('nationalId', cedula)
    useUserStore.getState().setPage(1) // Reset a primera página
  },

  // Cambiar vista entre activos/inactivos/todos
  setUserView: (view: 'active' | 'inactive' | 'all') => {
    const store = useUserStore.getState()
    switch (view) {
      case 'active':
        store.updateFilter('status', UserStatus.ACTIVE)
        break
      case 'inactive':
        store.updateFilter('status', UserStatus.INACTIVE)
        break
      case 'all':
        store.updateFilter('status', undefined)
        break
    }
    store.setPage(1)
  },

  // Limpiar búsqueda y filtros, mantener vista activa por defecto
  resetFilters: () => {
    useUserStore.getState().setFilters(DEFAULT_USER_FILTERS)
    useUserStore.getState().setSearchTerm('')
  }
}

// Hook para obtener estadísticas de usuarios
export const useUserStats = () => {
  const items = useUserStore((state) => state.items)

  return {
    total: items.length,
    active: items.filter((u) => u.status === UserStatus.ACTIVE).length,
    inactive: items.filter((u) => u.status === UserStatus.INACTIVE).length,
    preRegistration: items.filter((u) => u.status === UserStatus.PRE_REGISTRATION).length
  }
}
