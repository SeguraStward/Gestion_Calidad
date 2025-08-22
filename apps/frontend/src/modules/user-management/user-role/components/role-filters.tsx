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
      placeholder: 'Nombre del rol...'
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
    },
    {
      key: 'sortBy',
      label: 'Ordenar por',
      type: 'select',
      options: [
        { value: 'name', label: 'Nombre' },
        { value: 'createdAt', label: 'Fecha de creación' },
        { value: 'updatedAt', label: 'Última actualización' }
      ]
    },
    {
      key: 'sortOrder',
      label: 'Orden',
      type: 'select',
      options: [
        { value: 'asc', label: 'Ascendente' },
        { value: 'desc', label: 'Descendente' }
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
