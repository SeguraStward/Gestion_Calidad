import * as z from 'zod'
import { FileFieldProps, FormField, RelationFieldProps, SelectFieldProps, TextFieldProps } from './types'

export const buildSchema = (fields: FormField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {}

  // Verificar si fields existe y es un array
  if (!fields || !Array.isArray(fields)) {
    return z.object(shape)
  }

  fields.forEach((field) => {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case 'email':
        schema = z.string().email('Email inválido')
        break
      case 'number':
        schema = z.coerce
          .number({ invalid_type_error: 'Debe ser un número' })
          .refine(
            (val) => {
              if ('min' in field && field.min !== undefined) {
                return val >= field.min
              }
              return true
            },
            { message: `El valor debe ser mayor o igual a ${(field as TextFieldProps).min}` }
          )
          .refine(
            (val) => {
              if ('max' in field && field.max !== undefined) {
                return val <= field.max
              }
              return true
            },
            { message: `El valor debe ser menor o igual a ${(field as TextFieldProps).max}` }
          )
        break
      case 'date':
        schema = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Fecha inválida'
        })
        break
      case 'textarea':
        schema = z.string()
        break
      case 'checkbox':
        schema = z.boolean()
        break
      case 'select':
        if ((field as SelectFieldProps).isMulti) {
          schema = z.array(z.string()).optional()
        } else {
          schema = z.string().optional()
        }
        break
      case 'relation':
        if ((field as RelationFieldProps).isMulti) {
          schema = z.array(z.string()).optional()
        } else {
          schema = z.string().optional()
        }
        break
      case 'file':
        if ((field as FileFieldProps).isMulti) {
          schema = z.array(z.instanceof(File)).optional()
        } else {
          schema = z.instanceof(File).optional()
        }
        break
      default:
        schema = z.string()
    }

    // Add required validation
    if (field.required) {
      if (field.type === 'checkbox') {
        schema = schema.refine((val) => val === true, {
          message: 'Este campo es requerido'
        })
      } else if (['select', 'relation'].includes(field.type) && (field as any).isMulti) {
        schema = schema.refine((val) => val && val.length > 0, {
          message: 'Debe seleccionar al menos una opción'
        })
      } else if (field.type === 'file' && (field as FileFieldProps).isMulti) {
        schema = schema.refine((val) => val && val.length > 0, {
          message: 'Debe seleccionar al menos un archivo'
        })
      } else {
        schema = schema.refine((val) => val !== undefined && val !== null && val !== '', {
          message: 'Este campo es requerido'
        })
      }
    } else {
      schema = schema.optional()
    }

    // Add custom validation if provided
    if (field.validate) {
      schema = schema.superRefine((val, ctx) => {
        // This will be handled in the component with watch and custom validation
      })
    }

    shape[field.name] = schema
  })

  return z.object(shape)
}
