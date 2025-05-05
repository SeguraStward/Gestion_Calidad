import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormFieldProps {
  label: string
  id: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date'
  placeholder?: string
  error?: FieldError
  register: UseFormRegisterReturn
  required?: boolean
  disabled?: boolean
}

export const FormField = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  error,
  register,
  required = false,
  disabled = false
}: FormFieldProps) => (
  <div className="space-y-1">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      {...register}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
    {error && <p className="text-sm text-red-500">{error.message}</p>}
  </div>
)
