import { Label } from '@una-gc/ui/components/label'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormTextareaProps {
  label: string
  id: string
  placeholder?: string
  register: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
}

export const FormTextarea = ({ label, id, placeholder = '', register, error, required = false }: FormTextareaProps) => (
  <div className="space-y-1">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <textarea
      id={id}
      rows={4}
      placeholder={placeholder}
      {...register}
      className={`w-full border rounded p-2 ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-sm text-red-500">{error.message}</p>}
  </div>
)
