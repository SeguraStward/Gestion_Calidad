'use client'

import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Search, X } from 'lucide-react'
import { ReactNode } from 'react'

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'custom'
  placeholder?: string
  options?: { value: string; label: string }[]
  component?: ReactNode
}

export interface FiltersPanelProps<T> {
  filters: T
  fields: FilterField[]
  onFiltersChange: (filters: T) => void
  onSearch: () => void
  onClear: () => void
  children?: ReactNode
}

export function FiltersPanel<T extends Record<string, any>>({
  filters,
  fields,
  onFiltersChange,
  onSearch,
  onClear,
  children
}: FiltersPanelProps<T>) {
  const handleFilterChange = (key: keyof T, value: any) => {
    const newFilters = { ...filters, [key]: value === 'ALL' ? undefined : value }
    onFiltersChange(newFilters)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium">{field.label}</label>
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder}
              value={filters[field.key] || ''}
              onChange={(e) => handleFilterChange(field.key as keyof T, e.target.value)}
            />
          )}
          {field.type === 'select' && field.options && (
            <Select
              value={filters[field.key] || 'ALL'}
              onValueChange={(value) => handleFilterChange(field.key as keyof T, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === 'custom' && field.component}
        </div>
      ))}

      {children}

      {/* Botones de acción */}
      <div className="space-y-2">
        <label className="text-sm font-medium opacity-0">Acciones</label>
        <div className="flex gap-2">
          <Button onClick={onSearch} size="sm" className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button onClick={onClear} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
