'use client'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@una-gc/ui/components/select'
import { Badge } from '@una-gc/ui/components/badge'
import { X } from 'lucide-react'
import { Label } from '@una-gc/ui/components/label'
import { Button } from '@una-gc/ui/components/button'

import { cn } from '@una-gc/ui/lib/utils'

interface Option {
  id: string
  name: string
}

interface FormSelectMultipleProps {
  label?: string
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function FormSelectMultiple({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccione opciones...',
  className
}: FormSelectMultipleProps) {
  const selectedOptions = options.filter((opt) => value.includes(opt.id))

  const handleToggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v !== id))
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <Select onValueChange={handleToggle}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              <div className="flex justify-between w-full items-center">
                <span>{opt.name}</span>
                {value.includes(opt.id) && <span className="text-xs text-green-500">✓</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        {selectedOptions.map((opt) => (
          <Badge key={opt.id} className="flex items-center gap-1">
            {opt.name}
            <Button type="button" size="icon" variant="ghost" className="h-4 w-4 p-0" onClick={() => handleRemove(opt.id)}>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
