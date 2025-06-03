'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CrudForm, FormSection } from '@/app/(components)/crud/crud-form'
import { Status } from '@una-gc/database/prisma/generated/client'
import { toast } from 'sonner'

// Tipo de datos para el formulario
interface UserFormData {
  name: string
  email: string
  role: string
  department: string
  status: string
  phone?: string
  address?: string
  birthdate?: Date
  observations?: string
}

// Componente de ejemplo que usa CrudForm
export default function UserFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Configuramos el hook form
  const formMethods = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'ACTIVE',
      phone: '',
      address: '',
      observations: ''
    }
  })

  // Datos de ejemplo para los dropdowns
  const roleOptions = [
    { id: 'ADMIN', name: 'Administrador' },
    { id: 'USER', name: 'Usuario Regular' },
    { id: 'EDITOR', name: 'Editor' },
    { id: 'VIEWER', name: 'Visualizador' }
  ]

  const departmentOptions = [
    { id: 'IT', name: 'Tecnología' },
    { id: 'HR', name: 'Recursos Humanos' },
    { id: 'FINANCE', name: 'Finanzas' },
    { id: 'MARKETING', name: 'Marketing' },
    { id: 'OPERATIONS', name: 'Operaciones' }
  ]
  
  const statusOptions = Object.values(Status).map(s => ({ id: s, name: s === 'ACTIVE' ? 'Activo' : 'Inactivo' }))

  // Definimos las secciones del formulario
  const formSections: FormSection<UserFormData>[] = [
    {
      title: 'Información Básica',
      description: 'Datos principales del usuario',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Nombre completo',
          required: true,
          placeholder: 'Ingrese el nombre completo'
        },
        {
          type: 'email',
          name: 'email',
          label: 'Correo electrónico',
          required: true,
          placeholder: 'ejemplo@correo.com'
        },
        {
          type: 'select',
          name: 'role',
          label: 'Rol',
          required: true,
          options: roleOptions
        },
        {
          type: 'select',
          name: 'department',
          label: 'Departamento',
          required: true,
          options: departmentOptions
        }
      ]
    },
    {
      title: 'Información de Contacto',
      fields: [
        {
          type: 'text',
          name: 'phone',
          label: 'Teléfono',
          placeholder: '+506 8888 8888'
        },
        {
          type: 'text',
          name: 'address',
          label: 'Dirección',
          placeholder: 'Ingrese la dirección completa'
        },
        {
          type: 'date',
          name: 'birthdate',
          label: 'Fecha de nacimiento'
        },
        {
          type: 'select',
          name: 'status',
          label: 'Estado',
          required: true,
          options: statusOptions
        }
      ]
    },
    {
      title: 'Observaciones',
      fields: [
        {
          type: 'custom',
          name: 'observations',
          label: 'Observaciones',
          render: ({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Observaciones adicionales
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ingrese cualquier observación relevante sobre el usuario"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </div>
          )
        }
      ]
    }
  ]

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Validar el formulario
      const isValid = await formMethods.trigger()
      if (!isValid) {
        toast.error('Por favor complete todos los campos requeridos')
        return
      }
      
      // Obtener los datos del formulario
      const formData = formMethods.getValues()
      console.log('Datos del formulario:', formData)
      
      // Simular una petición al servidor
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mostrar mensaje de éxito
      toast.success('Usuario guardado exitosamente')
      
      // Reiniciar el formulario (opcional)
      // formMethods.reset()
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error('Ocurrió un error al guardar los datos')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para cancelar el formulario
  const handleCancel = () => {
    formMethods.reset()
    toast.info('Formulario cancelado')
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
      
      <CrudForm
        formMethods={formMethods}
        sections={formSections}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        title="Crear nuevo usuario"
        description="Complete la información para registrar un nuevo usuario en el sistema"
      />
    </div>
  )
}
