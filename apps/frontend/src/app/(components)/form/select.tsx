import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Label } from '@una-gc/ui/components/label'

interface FormSelectProps {
  id: string
  label: string
  value: string | null
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  placeholder: string
  required?: boolean
}

export const FormSelect = ({ id, label, value, onChange, options, placeholder, required = false }: FormSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
