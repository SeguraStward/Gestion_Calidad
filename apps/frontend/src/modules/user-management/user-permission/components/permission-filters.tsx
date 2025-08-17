'use client'

import { FiltersPanel, FilterField } from '@/components/base'
import { UserPermissionFilters } from '../types/user-permission.types'

interface PermissionFiltersProps {
  filters: UserPermissionFilters
  onFiltersChange: (filters: UserPermissionFilters) => void
  onSearch: () => void
  onClear: () => void
}

/**
 * Filters component for permission management
 */
export function PermissionFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClear
}: PermissionFiltersProps) {
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Nombre o código de permiso...'
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