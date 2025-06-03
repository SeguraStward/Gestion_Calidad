'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import { FormSection } from '@/app/(components)/crud/crud-form'
import { CrudModuleBase } from '@/app/(components)/crud/crud-module-base.new'
import { Status } from '@una-gc/database/prisma/generated/client'
import { ColumnDef } from '@tanstack/react-table'
import { ColumnUtilities } from '@/app/(components)/crud/crud-types'
import { UseQueryResult, useMutation, useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@una-gc/ui/components'
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  CalendarClock
} from 'lucide-react'

// Tipos para nuestro CRUD
interface UserItem {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  phone?: string
  birthdate?: string
  createdAt: string
}

interface CreateUserInput {
  name: string
  email: string
  role: string
  department: string
  status: string
  phone?: string
  birthdate?: string
}

interface UpdateUserInput extends CreateUserInput {}

// Ejemplo de integración completa de CrudModuleBase con CrudFormAdapter
export default function UserCrudExample() {
  // Mock data para simular una API
  const [users, setUsers] = useState<UserItem[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      role: 'ADMIN',
      department: 'IT',
      status: 'ACTIVE',
      phone: '+506 8888 1111',
      birthdate: '1990-05-15',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'María Rodríguez',
      email: 'maria.rodriguez@example.com',
      role: 'USER',
      department: 'HR',
      status: 'ACTIVE',
      phone: '+506 8888 2222',
      createdAt: '2023-02-15T00:00:00Z'
    },
    {
      id: '3',
      name: 'Carlos Sánchez',
      email: 'carlos.sanchez@example.com',
      role: 'EDITOR',
      department: 'MARKETING',
      status: 'INACTIVE',
      createdAt: '2023-03-20T00:00:00Z'
    }
  ])

  // Hooks simulados para un CRUD real
  const usePaginatedQuery = (queryParams: any): UseQueryResult<{ data: UserItem[], meta: { total: number, totalPages: number, page: number } }> => {
    return {
      data: {
        data: users,
        meta: { total: users.length, totalPages: 1, page: 1 }
      },
      isLoading: false,
      isSuccess: true,
      refetch: async () => ({ data: { data: users, meta: { total: users.length, totalPages: 1, page: 1 } } }),
    } as any
  }

  const useCreateMutation = () => {
    return useMutation({
      mutationFn: async (input: CreateUserInput) => {
        // Simular una petición a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newUser: UserItem = {
          id: Math.random().toString(36).substring(2, 9),
          ...input,
          createdAt: new Date().toISOString()
        }
        
        setUsers(prev => [...prev, newUser])
        return newUser
      }
    })
  }

  const useUpdateMutation = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string, data: UpdateUserInput }) => {
        // Simular una petición a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const updatedUser = { ...data, id, createdAt: users.find(u => u.id === id)?.createdAt || new Date().toISOString() }
        
        setUsers(prev => prev.map(user => user.id === id ? updatedUser as UserItem : user))
        return updatedUser as UserItem
      }
    })
  }

  const useDeleteMutation = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        // Simular una petición a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setUsers(prev => prev.filter(user => user.id !== id))
      }
    })
  }

  const useOneQuery = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: async () => {
        // Simular una petición a la API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const user = users.find(u => u.id === id)
        if (!user) throw new Error('Usuario no encontrado')
        
        return user
      },
      enabled: !!id
    })
  }

  // Datos para los dropdowns
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

  // Definición de columnas para la tabla
  const renderColumns = (utils: ColumnUtilities<UserItem>): ColumnDef<UserItem>[] => [
    {
      accessorKey: 'name',
      header: 'Nombre',
      size: 200,
      cell: ({ row }) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-primary mr-2" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-primary mr-2" />
          <span>{row.original.email}</span>
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      size: 150,
      cell: ({ row }) => {
        const role = row.original.role
        let badgeStyle = ""
        let roleName = ""
        
        switch (role) {
          case 'ADMIN':
            badgeStyle = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            roleName = "Administrador"
            break
          case 'EDITOR':
            badgeStyle = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            roleName = "Editor"
            break
          case 'USER':
            badgeStyle = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            roleName = "Usuario"
            break
          default:
            badgeStyle = "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400"
            roleName = role
        }
        
        return (
          <Badge variant="outline" className={badgeStyle}>
            {roleName}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'department',
      header: 'Departamento',
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-primary mr-2" />
          <span>{departmentOptions.find(d => d.id === row.original.department)?.name || row.original.department}</span>
        </div>
      )
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-primary mr-2" />
          <span>{row.original.phone || 'No registrado'}</span>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 100,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge 
            variant={status === 'ACTIVE' ? "outline" : "secondary"} 
            className={status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : ""}
          >
            {status === 'ACTIVE' ? "Activo" : "Inactivo"}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-center">
          <CalendarClock className="h-4 w-4 text-primary mr-2" />
          <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  utils.onEdit(row.original.id)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  utils.onDelete(row.original.id)
                }}
                className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
                disabled={utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id}
              >
                {utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]
  
  // Función para renderizar el formulario (usando CrudFormAdapter)
  const renderForm = (props: any) => {
    // Definir las secciones del formulario
    const getSections = ({ control, errors, editingItem, isUpdate }: any): FormSection<CreateUserInput | UpdateUserInput>[] => [
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
        title: 'Información Adicional',
        fields: [
          {
            type: 'text',
            name: 'phone',
            label: 'Teléfono',
            placeholder: '+506 8888 8888'
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
      }
    ]
    
    return (
      <CrudFormAdapter
        {...props}
        title={props.isUpdate ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        description={props.isUpdate ? 'Actualiza la información del usuario' : 'Ingresa los datos para crear un nuevo usuario'}
        sections={getSections}
      />
    )
  }

  // Configuración del CRUD
  const crudConfig = {
    entityName: 'Usuario',
    entityNamePlural: 'Usuarios',
    usePaginatedQuery,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
    useOneQuery,
    defaultFormValues: {
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'ACTIVE',
      phone: '',
      birthdate: ''
    } as CreateUserInput,
    renderForm,
    renderColumns,
    processItemForEditing: (item: UserItem) => {
      return {
        name: item.name,
        email: item.email,
        role: item.role,
        department: item.department,
        status: item.status,
        phone: item.phone || '',
        birthdate: item.birthdate || ''
      } as UpdateUserInput
    }
  }

  return (
    <div className="container mx-auto py-8">
      <CrudModuleBase {...crudConfig} />
    </div>
  )
}
