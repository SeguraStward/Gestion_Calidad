'use client'

import { Label } from '@una-gc/ui/components/label'
import { Textarea as ShadTextarea } from '@una-gc/ui/components/textarea' // Import ShadCN Textarea
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
    <ShadTextarea // Use ShadCN Textarea component
      id={id}
      rows={4}
      placeholder={placeholder}
      {...register}
      className={error ? 'border-red-500' : ''} // Conditional error styling
    />
    {error && <p className="text-sm text-red-500">{error.message}</p>}
  </div>
)
