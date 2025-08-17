'use client'

import { FiltersPanel, FilterField } from '@/components/base'
import type { UserRoleFilters } from '../types/user-role.types'

interface RoleFiltersComponentProps {
  filters: UserRoleFilters
  onFiltersChange: (filters: UserRoleFilters) => void
  onSearch: () => void
  onClear: () => void
}

/**
 * Filters component for role management
 */
export function RoleFiltersComponent({
  filters,
  onFiltersChange,
  onSearch,
  onClear
}: RoleFiltersComponentProps) {
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre o código del rol...'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Todos' },
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'INACTIVE', label: 'Inactivo' }
      ]
    }
  ]

  return (
    <FiltersPanel
      filters={filters}
      fields={filterFields}
      onFiltersChange={onFiltersChange}
      onSearch={onSearch}
      onClear={onClear}
    />
  )
}
