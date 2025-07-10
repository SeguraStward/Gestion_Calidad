import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { useEffect, useRef } from 'react'
import { useSelectStore } from '../store/select-store'
import { SelectFieldProps } from '../types'

interface SelectFieldComponentProps {
  field: SelectFieldProps
  onChange: (value: any) => void
  value: any
  errorMessage?: string
}

export const SelectField = ({ field, onChange, value, errorMessage }: SelectFieldComponentProps) => {
  const isMulti = field.isMulti
  const initialRender = useRef(true)
  const { setValue, getFieldValue } = useSelectStore()
  const storeKey = `select-${field.name}`

  // Sincronizar el valor externo con el store solo en la primera renderización
  // o cuando cambia desde el exterior (no por cambios internos)
  useEffect(() => {
    if (initialRender.current) {
      setValue(storeKey, value)
      initialRender.current = false
    } else if (value !== getFieldValue(storeKey)) {
      setValue(storeKey, value)
    }
  }, [value, storeKey, setValue, getFieldValue])

  // Para selección múltiple
  if (isMulti) {
    const currentValues = Array.isArray(value) ? value : []

    return (
      <div className="flex flex-wrap gap-2 border rounded p-2">
        {field.options?.map((opt: any) => (
          <div key={opt.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${field.name}-${opt.id}`}
              checked={currentValues.includes(opt.id)}
              onCheckedChange={(checked) => {
                const newValue = checked ? [...currentValues, opt.id] : currentValues.filter((id) => id !== opt.id)

                setValue(storeKey, newValue)
                onChange(newValue)
              }}
              disabled={field.disabled}
            />
            <label htmlFor={`${field.name}-${opt.id}`} className="text-sm">
              {opt.name}
            </label>
          </div>
        ))}
      </div>
    )
  }

  // Manejar cambio para selección única
  const handleValueChange = (newValue: string) => {
    setValue(storeKey, newValue)
    onChange(newValue)
  }

  // Usar el valor del store como fuente única de verdad
  const currentValue = getFieldValue(storeKey) || ''

  return (
    <Select value={currentValue.toString()} onValueChange={handleValueChange} disabled={field.disabled ?? false}>
      <SelectTrigger
        id={field.name}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${field.name}-error` : undefined}
      >
        <SelectValue placeholder={field.placeholder || 'Seleccionar...'} />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((opt: any, index: number) => (
          <SelectItem key={`${opt.id}-${index}`} value={opt.id.toString()}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
