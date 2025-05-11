import * as z from 'zod'

// npm install react-hook-form zod @hookform/resolvers, se debe corregir por pnpm

// example form fields
const formFields = [
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'age', label: 'Edad', type: 'number', required: false },
  { name: 'birthdate', label: 'Fecha de nacimiento', type: 'date', required: true },
  { name: 'newsletter', label: '¿Deseas recibir noticias?', type: 'checkbox', required: false },
  { name: 'gender', label: 'Género', type: 'select', required: true, options: ['Masculino', 'Femenino', 'Otro'] }
]

const buildSchema = (fields: typeof formFields) => {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case 'email':
        schema = z.string().email()
        break
      case 'number':
        schema = z.number().or(z.string().regex(/^\d+$/).transform(Number))
        break
      case 'date':
        schema = z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' })
        break
      case 'checkbox':
        schema = z.boolean()
        break
      case 'select':
        if (Array.isArray(field.options) && field.options.length > 0) {
          schema = z.enum(field.options as [string, ...string[]])
        } else {
          throw new Error(`Invalid options for select field: ${field.name}`)
        }
        break
      default:
        schema = z.string()
    }

    if (field.required) {
      shape[field.name] = schema
    } else {
      shape[field.name] = schema.optional()
    }
  })

  return z.object(shape)
}

const formSchema = buildSchema(formFields)
