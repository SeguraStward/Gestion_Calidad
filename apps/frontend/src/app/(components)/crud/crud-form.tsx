'use client'

import { FormField } from '@/app/(components)/form/field'
import { ComboboxOption, FormSelect } from '@/app/(components)/form/select'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Separator } from '@una-gc/ui/components'
import { Loader2, Save, X } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { Controller, FieldError, FieldValues, Path, RegisterOptions, UseFormReturn } from 'react-hook-form'

// Tipos de campos soportados
export type FieldType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'checkbox' | 'custom'

// Opciones comunes para todos los campos
interface BaseFieldConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helperText?: string
  className?: string
  hidden?: boolean
  valueAsNumber?: boolean // <-- Añadido para conversión automática
  rules?: RegisterOptions<T>
}

// Configuración específica para campos de texto
interface TextFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'text' | 'email' | 'password' | 'number' | 'date'
  min?: number
  max?: number
  step?: number
}

// Configuración específica para campos select
interface SelectFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'select'
  options: ComboboxOption[] | (() => ComboboxOption[])
  isLoading?: boolean
}

// Configuración para campos personalizados
interface CustomFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'custom'
  render: (props: {
    field: {
      value: any
      onChange: (value: any) => void
    }
    formState: UseFormReturn<T>['formState']
    disabled: boolean
  }) => ReactNode
}

// Unión de todos los tipos de configuraciones de campo
export type FieldConfig<T extends FieldValues> = TextFieldConfig<T> | SelectFieldConfig<T> | CustomFieldConfig<T>

// Configuración para una sección del formulario
export interface FormSection<T extends FieldValues> {
  title?: string
  description?: string
  fields: FieldConfig<T>[]
}

// Props para el componente CrudForm
export interface CrudFormProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>
  sections: FormSection<T>[]
  onSubmit: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  isUpdate?: boolean
  submitButtonText?: string
  cancelButtonText?: string
  title?: string
  description?: string
  footerContent?: ReactNode
}

export function CrudForm<T extends FieldValues>({
  formMethods,
  sections,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isUpdate = false,
  submitButtonText,
  cancelButtonText = 'Cancelar',
  title,
  description,
  footerContent
}: CrudFormProps<T>) {
  const { control, formState } = formMethods
  const { errors } = formState

  // Textos predeterminados para los botones
  const defaultSubmitText = useMemo(() => {
    if (isSubmitting) {
      return isUpdate ? 'Actualizando...' : 'Creando...'
    }
    return isUpdate ? 'Actualizar' : 'Crear'
  }, [isSubmitting, isUpdate])

  // Renderizar un campo según su tipo
  const renderField = (field: FieldConfig<T>) => {
    if (field.hidden) return null

    // Extraer propiedades comunes
    const { name, label, required, disabled, placeholder, helperText, className, rules } = field as any

    // Si es un campo personalizado, usar la función de renderizado proporcionada
    if (field.type === 'custom' && 'render' in field) {
      return (
        <div key={String(name)} className={`space-y-1 ${className || ''}`}>
          <Controller
            name={name}
            control={control}
            rules={rules || { required: required ? `${label} es requerido` : false }}
            render={({ field: { value, onChange } }) => (
              <>
                {field.render({
                  field: { value, onChange },
                  formState,
                  disabled: disabled || isSubmitting
                })}
                {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}{' '}
                {errors[name] && <p className="text-sm text-destructive">{errors[name]?.message as string}</p>}
              </>
            )}
          />
        </div>
      )
    }

    // Renderizar campos select
    if (field.type === 'select') {
      const options = typeof field.options === 'function' ? field.options() : field.options
      return (
        <div key={String(name)} className={`space-y-1 ${className || ''}`}>
          <Controller
            name={name}
            control={control}
            rules={rules || { required: required ? `${label} es requerido` : false }}
            render={({ field: { value, onChange } }) => (
              <FormSelect
                id={String(name)}
                label={label}
                options={options}
                value={value}
                onChange={(val) => {
                  if (field.valueAsNumber) {
                    onChange(val === '' ? undefined : Number(val))
                  } else {
                    onChange(val)
                  }
                }}
                placeholder={field.isLoading ? 'Cargando...' : placeholder}
                required={required}
                error={errors[name] ? ({ message: errors[name]?.message as string } as FieldError) : undefined}
              />
            )}
          />
          {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
        </div>
      )
    }

    // Renderizar campos de texto y numéricos
    const fieldRules = rules || { required: required ? `${label} es requerido` : false }
    const registerOpts = field.type === 'number' ? { valueAsNumber: true, ...fieldRules } : fieldRules

    // Build props object for FormField, only including min/max/step if defined
    const formFieldProps: any = {
      control,
      name,
      label,
      id: String(name),
      type: field.type,
      placeholder,
      ...(errors[name] && { error: { message: errors[name]?.message as string } as FieldError }),
      required,
      disabled: disabled || isSubmitting,
      registerOptions: registerOpts
    }
    if (field.type === 'number') {
      if (typeof field.min === 'number') formFieldProps.min = field.min
      if (typeof field.max === 'number') formFieldProps.max = field.max
      if (typeof field.step === 'number') formFieldProps.step = field.step
    }

    return (
      <div key={String(name)} className={`space-y-1 ${className || ''}`}>
        <FormField {...formFieldProps} />
        {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
      </div>
    )
  }

  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              {section.title && (
                <>
                  <div className="space-y-1">
                    {section.title && <h3 className="text-lg font-medium">{section.title}</h3>}
                    {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                  </div>
                  <Separator className="my-2" />
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{section.fields.map((field) => renderField(field))}</div>

              {index < sections.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between space-x-2 border-t pt-4 mt-4">
        {footerContent || (
          <>
            <div className="flex-1">{/* Espacio para contenido adicional a la izquierda */}</div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  <X className="h-4 w-4 mr-2" />
                  {cancelButtonText}
                </Button>
              )}
              <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {submitButtonText || defaultSubmitText}
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
