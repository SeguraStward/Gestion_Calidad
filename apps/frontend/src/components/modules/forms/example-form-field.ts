import { FormField } from './types'

// Example usage with user entity
export const userFormFields: FormField[] = [
  {
    name: 'email',
    label: 'Correo electrónico',
    type: 'email',
    required: true,
    validate: (value) => {
      // Custom validation example
      if (value && !value.includes('@')) {
        return 'Email debe contener @'
      }
      return true
    }
  },
  {
    name: 'fullName',
    label: 'Nombre completo',
    type: 'text',
    required: true
  },
  {
    name: 'fullLastName',
    label: 'Apellidos',
    type: 'text',
    required: false
  },
  {
    name: 'nationalId',
    label: 'Identificación',
    type: 'text',
    required: false
  },
  {
    name: 'birthDate',
    label: 'Fecha de nacimiento',
    type: 'date',
    required: false
  },
  {
    name: 'primaryPhone',
    label: 'Teléfono principal',
    type: 'text',
    required: false
  },
  {
    name: 'province',
    label: 'Provincia',
    type: 'select',
    required: false,
    options: [
      { id: 'SAN_JOSE', name: 'San José' },
      { id: 'ALAJUELA', name: 'Alajuela' },
      { id: 'CARTAGO', name: 'Cartago' },
      { id: 'HEREDIA', name: 'Heredia' },
      { id: 'GUANACASTE', name: 'Guanacaste' },
      { id: 'PUNTARENAS', name: 'Puntarenas' },
      { id: 'LIMON', name: 'Limón' }
    ]
  },
  {
    name: 'canton',
    label: 'Cantón',
    type: 'text',
    required: false,
    // Show canton only if province is selected
    condition: (data) => !!data.province
  },
  {
    name: 'district',
    label: 'Distrito',
    type: 'text',
    required: false,
    // Show district only if canton is selected
    condition: (data) => !!data.canton
  },
  {
    name: 'address',
    label: 'Dirección',
    type: 'textarea',
    required: false
  },
  {
    name: 'roles',
    label: 'Roles',
    type: 'select',
    required: true,
    isMulti: true,
    options: [
      { id: 'ADMIN', name: 'Administrador' },
      { id: 'USER', name: 'Usuario' },
      { id: 'STUDENT', name: 'Estudiante' },
      { id: 'PROFESSOR', name: 'Profesor' }
    ]
  },
  {
    name: 'profilePicture',
    label: 'Foto de perfil',
    type: 'file',
    required: false,
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024 // 5MB
  }
]
