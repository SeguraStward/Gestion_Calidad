'use client'

import { FiltersPanel, FilterField } from '@/components/base'
import type { UserFilters } from '../types/user.types'

interface UserFiltersComponentProps {
  filters: UserFilters
  roles?: Array<{ id: string; name: string }>
  onFiltersChange: (filters: UserFilters) => void
  onSearch: () => void
  onClear: () => void
}

/**
 * Filters component for user management
 */
export function UserFiltersComponent({
  filters,
  roles = [],
  onFiltersChange,
  onSearch,
  onClear
}: UserFiltersComponentProps) {
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre, apellido o email...'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Todos' },
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'INACTIVE', label: 'Inactivo' },
        { value: 'PRE_REGISTRATION', label: 'Pre-registro' }
      ]
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Todos' },
        ...roles.map(role => ({ value: role.id, label: role.name }))
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
