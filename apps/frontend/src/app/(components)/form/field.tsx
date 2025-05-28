'use client'

import { useController, Control, FieldError, Path } from 'react-hook-form'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'

interface FormFieldProps<T extends Record<string, any>> {
  label: string
  id: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'url' | 'time'
  placeholder?: string
  error?: FieldError
  control: Control<T>
  name: Path<T>
  required?: boolean
  disabled?: boolean
  rules?: any
  min?: number
  max?: number
  step?: number
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const FormField = <T extends Record<string, any>>({
  label,
  id,
  type = 'text',
  placeholder = '',
  error,
  control,
  name,
  required = false,
  disabled = false,
  rules,
  min,
  max,
  step,
  inputProps = {}
}: FormFieldProps<T>) => {
  const {
    field: { onChange, value }
  } = useController<T>({
    control,
    name,
    defaultValue: '' as any,
    rules
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
        onChange={(e) => onChange(e)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={error ? 'border-red-500' : ''}
        {...inputProps}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
