'use client'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@una-gc/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@una-gc/ui/components/popover'
import { Button } from '@una-gc/ui/components/button'
import { Label } from '@una-gc/ui/components/label'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'
import { useState, useMemo, useEffect } from 'react'
import { FieldError } from 'react-hook-form'

export interface ComboboxOption {
  id: string
  name: string
  capacidad?: number // campo opcional para mostrar capacidad
  [key: string]: any // permitir otros campos
}

interface ComboboxProps {
  label: string
  value: string | null
  options: ComboboxOption[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: FieldError | undefined
  id?: string
  maxHeight?: number // altura máxima del scroll
}

export const FormSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  id,
  required,
  error,
  maxHeight = 250 // altura máxima por defecto
}: ComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((opt) => opt.id === value)

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options
    return options.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', error ? 'border-red-500' : '')}
          >
            {selected?.name || placeholder || 'Seleccionar...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} value={search} onValueChange={setSearch} />
            <CommandEmpty>No se encontró nada.</CommandEmpty>
            <CommandGroup>
              <div style={{ maxHeight, overflowY: 'auto' }}>
                {filteredOptions.map((option, idx) => (
                  <CommandItem
                    key={`${option.id}-${idx}`}
                    onSelect={() => {
                      onChange(option.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex flex-col">
                      <span>{option.name}</span>
                      {option.capacidad !== undefined && (
                        <span className="text-xs text-muted-foreground">Capacidad: {option.capacidad}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
