import { Label } from '@una-gc/ui/components/label'
import { Input } from '@una-gc/ui/components/input'

interface FormFileInputProps {
  id: string
  label: string
  onChange: (file: File | null) => void
  accept?: string
  required?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const FormFileInput = ({ id, label, onChange, accept = '*', required = false }: FormFileInputProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={id} type="file" accept={accept} required={required} onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  )
}
