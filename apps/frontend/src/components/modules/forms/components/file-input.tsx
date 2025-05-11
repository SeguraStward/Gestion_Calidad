import { Input } from '@una-gc/ui/components/input'
import { FileFieldProps } from '../types'

// Component to handle file inputs
export const FileInputComponent = ({
  field,
  value,
  onChange,
  error
}: {
  field: FileFieldProps
  value: any
  onChange: (value: any) => void
  error?: string
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (field.isMulti) {
      onChange(Array.from(files))
    } else {
      onChange(files[0] || null)
    }
  }

  return (
    <div>
      <Input
        id={field.name}
        type="file"
        accept={field.accept}
        multiple={field.isMulti}
        disabled={field.disabled}
        onChange={handleFileChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
      {field.maxSize && (
        <p className="text-xs text-gray-500 mt-1">Tamaño máximo: {(field.maxSize / (1024 * 1024)).toFixed(2)} MB</p>
      )}
    </div>
  )
}
