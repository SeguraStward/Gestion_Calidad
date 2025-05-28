'use client'

import { Label } from '@una-gc/ui/components/label'
import { Input } from '@una-gc/ui/components/input'
import { forwardRef } from 'react'

interface FormFileInputProps {
  id: string
  label: string
  onChange: (file: File | null) => void
  accept?: string
  required?: boolean
}

export const FormFileInput = forwardRef<HTMLInputElement, FormFileInputProps>(
  ({ id, label, onChange, accept = '*', required = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      onChange(file)
    }

    return (
      <div className="flex flex-col justify-center items-center h-full space-y-1">
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={id}
          type="file"
          accept={accept}
          required={required}
          onChange={handleChange}
          ref={ref} // ✅ Aquí aplicás el ref al input real
        />
      </div>
    )
  }
)

FormFileInput.displayName = 'FormFileInput' // Necesario para que React no tire warnings
