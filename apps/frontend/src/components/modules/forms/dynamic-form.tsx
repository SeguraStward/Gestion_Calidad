import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@una-gc/ui/components/button'
import { useSelectStore } from './store/select-store'
import { buildSchema } from './schema-builder'

import { CheckboxField, FileInputComponent, RelationFieldComponent, SelectField, TextareaField, TextField } from './components'

import { DynamicFormProps, FormField, SelectFieldProps, RelationFieldProps, FileFieldProps } from './types'

export default function DynamicForm({
  fields = [],
  onSubmit,
  onCancel,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  className = '',
  initialValues = {},
  isLoading = false
}: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(isLoading)

  // Asegurar que fields sea un array
  const safeFields = useMemo(() => (Array.isArray(fields) ? fields : []), [fields])

  // Memoizar el esquema para evitar reconstrucciones innecesarias
  const schema = useMemo(() => buildSchema(safeFields), [safeFields])

  type FormValues = z.infer<typeof schema>

  // Memoizar los valores predeterminados
  const defaultValues = useMemo(
    () =>
      safeFields.reduce(
        (acc, field) => {
          if (initialValues[field.name] !== undefined) {
            acc[field.name] = initialValues[field.name]
          } else {
            switch (field.type) {
              case 'checkbox':
                acc[field.name] = false
                break
              case 'select':
                acc[field.name] = (field as SelectFieldProps).isMulti ? [] : ''
                break
              case 'relation':
                acc[field.name] = (field as RelationFieldProps).isMulti ? [] : ''
                break
              case 'file':
                acc[field.name] = (field as FileFieldProps).isMulti ? [] : null
                break
              default:
                acc[field.name] = ''
            }
          }
          return acc
        },
        {} as Record<string, any>
      ),
    [safeFields, initialValues]
  )

  const { resetAll } = useSelectStore()

  // Limpiar store al desmontar el componente
  useEffect(() => {
    return () => {
      resetAll()
    }
  }, [resetAll])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty }
  } = form

  // Observar todos los valores para renderizado condicional y validación personalizada
  const formValues = watch()

  // Aplicar validaciones personalizadas
  useEffect(() => {
    // Añadir esta bandera para prevenir actualizaciones innecesarias
    let hasChanges = false

    safeFields.forEach((field) => {
      if (field.validate) {
        const value = formValues[field.name]
        const validationResult = field.validate(value, formValues)
        const currentError = errors[field.name]

        // Solo actualizar errores si realmente hay un cambio
        if (validationResult !== true && (!currentError || currentError.message !== validationResult)) {
          hasChanges = true
          form.setError(field.name, {
            type: 'custom',
            message: validationResult
          })
        } else if (validationResult === true && currentError?.type === 'custom') {
          hasChanges = true
          form.clearErrors(field.name)
        }
      }
    })

    // Solo aplicar cambios si realmente es necesario
    if (!hasChanges) {
      return
    }
  }, [formValues, safeFields, form, errors])

  // Manejar envío del formulario
  const handleFormSubmit = useCallback(
    async (data: FormValues) => {
      try {
        setIsSubmitting(true)
        await onSubmit(data)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit]
  )

  // Manejar cancelación
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  // Manejar descarte de cambios
  const handleDiscard = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  // Renderizar campo según su tipo
  const renderField = useCallback(
    (field: FormField, errorMessage?: string) => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'password':
          return <TextField field={field} register={register} errorMessage={errorMessage} />
        case 'textarea':
          return <TextareaField field={field} register={register} errorMessage={errorMessage} />
        case 'checkbox':
          return <CheckboxField field={field} register={register} errorMessage={errorMessage} />
        case 'select':
          return (
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, value } }) => (
                <SelectField field={field} onChange={onChange} value={value} errorMessage={errorMessage} />
              )}
            />
          )
        case 'relation':
          return (
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, value } }) => (
                <RelationFieldComponent
                  field={field as RelationFieldProps}
                  value={value}
                  onChange={onChange}
                  error={errorMessage}
                />
              )}
            />
          )
        case 'file':
          return (
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, value } }) => (
                <FileInputComponent field={field as FileFieldProps} value={value} onChange={onChange} error={errorMessage} />
              )}
            />
          )
        default:
          return null
      }
    },
    [control, register]
  )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        {safeFields.map((field) => {
          const shouldShow = !field.condition || field.condition(formValues)
          if (!shouldShow) return null

          const errorMessage = errors[field.name]?.message as string | undefined
          const hasError = Boolean(errorMessage)

          return (
            <div key={field.name} className="form-field-container mb-4">
              <label
                htmlFor={field.name}
                className={`block text-sm font-medium mb-1 ${field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
              >
                {field.label}
              </label>

              {field.description && <p className="text-sm text-gray-500 mb-2">{field.description}</p>}

              <div className={`${hasError ? 'ring-1 ring-red-500 rounded-sm' : ''}`}>{renderField(field, errorMessage)}</div>

              {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {isDirty && (
          <Button type="button" onClick={handleDiscard} disabled={isSubmitting} variant="outline" className="mr-auto">
            Descartar cambios
          </Button>
        )}

        {onCancel && (
          <Button type="button" onClick={handleCancel} disabled={isSubmitting} variant="outline">
            {cancelText}
          </Button>
        )}

        <Button type="submit" disabled={isSubmitting} className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}>
          {isSubmitting ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  )
}
