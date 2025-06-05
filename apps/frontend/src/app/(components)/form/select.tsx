'use client'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@una-gc/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@una-gc/ui/components/popover'
import { Button } from '@una-gc/ui/components/button'
import { Label } from '@una-gc/ui/components/label' // Import ShadCN Label
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'
import { useState } from 'react'
import { FieldError } from 'react-hook-form'

export interface ComboboxOption {
  id: string
  name: string
}

interface ComboboxProps {
  label: string
  value: string | null
  options: ComboboxOption[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: FieldError | undefined
  id?: string // Added id for Label htmlFor
}

export const FormSelect = ({ label, value, options, onChange, placeholder, id, required, error }: ComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.id === value)

  return (
    <div className="space-y-1">
      {/* Use ShadCN Label component */}
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
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandEmpty>No se encontró nada.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
