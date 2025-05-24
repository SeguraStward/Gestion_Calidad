'use client'

import { useController, Control } from 'react-hook-form'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

// Definir el tipo FormData
type FormData = {
  startTime: string
  endTime: string
}

// Componente FormField
interface FormFieldProps {
  label: string
  id: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'url' | 'time'
  placeholder?: string
  error?: FieldError
  control: Control<FormData> // Asegúrate de que Control es de tipo FormData
  name: keyof FormData // El nombre del campo debe coincidir con las claves de FormData
  required?: boolean
  disabled?: boolean
}

export const FormField = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  error,
  control,
  name,
  required = false,
  disabled = false
}: FormFieldProps) => {
  const {
    field: { onChange, value }
  } = useController<FormData>({
    // Asegúrate de que useController tenga el tipo FormData
    control,
    name,
    defaultValue: '' // Ajusta el valor por defecto si es necesario
  })

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e) // Esto asegura que 'react-hook-form' maneje el cambio correctamente
        }}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
