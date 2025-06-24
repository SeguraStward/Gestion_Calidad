import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@una-gc/ui/components/select'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { RelationFieldProps } from '../types'

// Component to handle relation fields
export const RelationFieldComponent = ({
  field,
  value,
  onChange,
  error
}: {
  field: RelationFieldProps
  value: any
  onChange: (value: any) => void
  error?: string
}) => {
  const [options, setOptions] = useState<Array<Record<string, any>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true)
        const fetchedOptions = await field.fetchOptions()
        setOptions(fetchedOptions)
      } catch (err) {
        console.error(`Error fetching options for ${field.name}:`, err)
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [field]) // Include the entire field object to ensure all dependencies are accounted for

  const singleValue = useMemo(() => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : ''
    }
    return value || ''
  }, [value])

  // Move the useCallback outside of conditional paths
  const handleValueChange = useCallback(
    (newValue: string) => {
      onChange(newValue)
    },
    [onChange]
  )

  const handleCheckboxChange = useCallback(
    (checked: boolean, optValue: any) => {
      if (checked) {
        onChange(Array.isArray(value) ? [...value, optValue] : [optValue])
      } else {
        onChange(Array.isArray(value) ? value.filter((id) => id !== optValue) : [])
      }
    },
    [onChange, value]
  )

  if (field.isMulti) {
    return (
      <div className="flex flex-col gap-2 border rounded p-2">
        {loading ? (
          <div className="text-sm text-gray-500">Cargando opciones...</div>
        ) : (
          options.map((opt) => (
            <div key={opt[field.valueField || 'id']} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${opt[field.valueField || 'id']}`}
                checked={Array.isArray(value) && value.includes(opt[field.valueField || 'id'])}
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, opt[field.valueField || 'id'])}
                disabled={field.disabled}
              />
              <label htmlFor={`${field.name}-${opt[field.valueField || 'id']}`} className="text-sm">
                {opt[field.displayField]}
              </label>
            </div>
          ))
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="h-9 px-3 py-2 border rounded flex items-center text-sm text-gray-500">Cargando opciones...</div>
  }

  return (
    <Select defaultValue={singleValue} onValueChange={handleValueChange} disabled={field.disabled}>
      <SelectTrigger id={field.name} aria-invalid={!!error} aria-describedby={error ? `${field.name}-error` : undefined}>
        <SelectValue placeholder="Seleccionar..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, index) => (
          <SelectItem key={`${opt[field.valueField || 'id']}-${index}`} value={opt[field.valueField || 'id']}>
            {opt[field.displayField]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
