'use client'

import { useEntityActions, useEntityList } from '@/lib/api/hooks'
import { UserFilters } from '@/lib/api/modules/user/user.types'
import { UserStatus } from '@una-gc/database/prisma/generated/client'
import { useUserService } from './use-user-service'

const DEFAULT_USER_FILTERS: UserFilters = {
  status: 'ACTIVE'
}

export function useUserList(initialFilters: UserFilters = DEFAULT_USER_FILTERS) {
  const { getUsers } = useUserService()

  const entityList = useEntityList(
    async (filters: UserFilters, page: number, limit: number) => {
      const response = await getUsers({ ...filters, page, limit })
      return {
        items: response.data,
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      }
    },
    {
      initialFilters,
      autoLoad: true
    }
  )

  const actions = useEntityActions({
    onSuccess: (action) => {
      if (action === 'archive' || action === 'reactivate') {
        entityList.refresh()
      }
    }
  })

  const { changeUserStatus } = useUserService()

  const archiveUser = async (userId: string) => {
    return await actions.execute('archive', () => changeUserStatus(userId, UserStatus.INACTIVE))
  }

  const reactivateUser = async (userId: string) => {
    return await actions.execute('reactivate', () => changeUserStatus(userId, UserStatus.ACTIVE))
  }

  const searchByNationalId = (nationalId: string) => {
    entityList.updateFilter('nationalId', nationalId)
  }

  const filterByStatus = (status: UserStatus) => {
    entityList.updateFilter('status', status)
  }

  const clearFilters = () => {
    entityList.clearFilters(DEFAULT_USER_FILTERS)
  }

  return {
    // Data
    users: entityList.data.items,
    loading: entityList.loading,
    error: entityList.error,
    pagination: {
      page: entityList.data.page,
      limit: entityList.data.limit,
      total: entityList.data.total,
      totalPages: entityList.data.totalPages
    },

    // Filters
    filters: entityList.filters,
    setFilters: entityList.setFilters,
    updateFilter: entityList.updateFilter,
    clearFilters,
    searchByNationalId,
    filterByStatus,

    // Pagination
    setPage: entityList.setPage,
    setLimit: entityList.setLimit,

    // Actions
    refresh: entityList.refresh,
    archiveUser,
    reactivateUser,

    // Action states
    actionLoading: actions.loading,
    actionErrors: actions.errors
  }
}
