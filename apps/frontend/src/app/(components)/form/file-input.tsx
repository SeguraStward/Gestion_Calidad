'use client'

import { Label } from '@una-gc/ui/components/label'
import { Input as ShadInput } from '@una-gc/ui/components/input' // Import ShadCN Input
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
      <div className="grid w-full max-w-sm items-center gap-1.5"> {/* ShadCN recommended styling for file input */} 
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <ShadInput // Use ShadCN Input component
          id={id}
          type="file"
          accept={accept}
          required={required}
          onChange={handleChange}
          ref={ref} 
        />
      </div>
    )
  }
)

FormFileInput.displayName = 'FormFileInput'
