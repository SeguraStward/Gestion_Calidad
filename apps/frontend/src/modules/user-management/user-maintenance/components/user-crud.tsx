'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import { usePaginatedUsers, useCreateUser, useUpdateUser, useDeleteUser, useUser } from '../hooks/useUserCrud'
import { useActiveUserRolesFlat } from '../../user-roles/hooks/useUserRole'
import type { UserWithRelations, CreateUserInput, UpdateUserInput } from '@/shared/types/user'
import { UserCircle2, Mail, BadgeCheck, BadgeX, Phone, Hash, Pencil, Trash2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/app/(components)/ui/page-header'
import { Badge, Button } from '@una-gc/ui/components'
import { FormSelectMultiple } from '@/app/(components)/form/select-multiple'

// Opciones de status
const STATUS_OPTIONS = [
  { id: 'ACTIVE', name: 'Activo' },
  { id: 'INACTIVE', name: 'Inactivo' },
  { id: 'PRE_REGISTRATION', name: 'Pre-registro' }
]

// Opciones de provincia según el enum de Prisma
const PROVINCE_OPTIONS = [
  { id: 'SAN_JOSE', name: 'San José' },
  { id: 'ALAJUELA', name: 'Alajuela' },
  { id: 'CARTAGO', name: 'Cartago' },
  { id: 'HEREDIA', name: 'Heredia' },
  { id: 'GUANACASTE', name: 'Guanacaste' },
  { id: 'PUNTARENAS', name: 'Puntarenas' },
  { id: 'LIMON', name: 'Limón' }
]

export default function UserCrud() {
  // Obtener roles disponibles en el nivel superior del componente
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useActiveUserRolesFlat()

  const roleOptions =
    rolesData?.map((role: any) => ({
      id: role.id,
      name: role.name
    })) || []

  // Debug logging para verificar que los roles se cargan correctamente
  console.log('🔍 UserCrud Debug:', {
    rolesData,
    roleOptions,
    rolesLoading,
    rolesError
  })

  // Columnas de la tabla de usuarios
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<UserWithRelations>): ColumnDef<UserWithRelations>[] => [
        {
          accessorKey: 'email',
          header: 'Correo',
          size: 180,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[120px] max-w-[220px] truncate whitespace-nowrap">
              <Mail className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">{row.original.email}</span>
            </div>
          )
        },
        {
          accessorKey: 'fullName',
          header: 'Nombre',
          size: 160,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[100px] max-w-[180px] truncate whitespace-nowrap">
              <UserCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">{row.original.fullName}</span>
            </div>
          )
        },
        {
          accessorKey: 'fullLastName',
          header: 'Apellidos',
          size: 160,
          cell: ({ row }) => <span>{row.original.fullLastName}</span>
        },
        {
          accessorKey: 'primaryPhone',
          header: 'Teléfono',
          size: 120,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[80px] max-w-[120px] truncate whitespace-nowrap">
              <Phone className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span>{row.original.primaryPhone}</span>
            </div>
          )
        },
        {
          accessorKey: 'status',
          header: 'Estado',
          size: 100,
          cell: ({ row }) => {
            const status = row.original.status
            let badgeClasses = ''
            let statusText = ''
            if (status === 'ACTIVE') {
              badgeClasses =
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              statusText = 'Activo'
            } else if (status === 'INACTIVE') {
              badgeClasses = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800'
              statusText = 'Inactivo'
            } else {
              badgeClasses =
                'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
              statusText = 'Pre-registro'
            }
            return (
              <Badge variant="outline" className={badgeClasses + ' min-w-[70px] justify-center'}>
                {statusText}
              </Badge>
            )
          }
        },
        {
          id: 'actions',
          header: () => <div className="text-right">Acciones</div>,
          size: 90,
          cell: ({ row }) => (
            <div className="text-right flex gap-1 justify-end min-w-[80px]">
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => utils.onEdit(row.original.id)} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Eliminar"
                disabled={utils.isProcessing}
                onClick={() => utils.onDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      ],
    []
  )
  // Formulario de usuario
  const renderForm = useMemo(() => {
    function UserCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          description={isUpdate ? 'Actualice los datos del usuario' : 'Complete los datos para registrar un nuevo usuario'}
          sections={() => [
            {
              title: 'Datos Básicos',
              fields: [
                {
                  type: 'text',
                  name: 'email',
                  label: 'Correo electrónico',
                  required: true,
                  placeholder: 'usuario@ejemplo.com',
                  helperText: 'Correo único del usuario',
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'fullName',
                  label: 'Nombre',
                  required: true,
                  placeholder: 'Nombre(s) del usuario'
                },
                {
                  type: 'text',
                  name: 'fullLastName',
                  label: 'Apellidos',
                  required: false,
                  placeholder: 'Apellidos del usuario'
                },
                {
                  type: 'text',
                  name: 'primaryPhone',
                  label: 'Teléfono principal',
                  required: false,
                  placeholder: 'Solo números, ej: 88887777',
                  helperText: 'Solo números sin espacios ni guiones'
                },
                {
                  type: 'text',
                  name: 'nationalId',
                  label: 'Cédula',
                  required: false,
                  placeholder: 'Solo números, ej: 123456789',
                  helperText: 'Solo números sin espacios ni guiones'
                },
                {
                  type: 'date',
                  name: 'birthDate',
                  label: 'Fecha de nacimiento',
                  required: false
                }
              ]
            },
            {
              title: 'Ubicación y Profesión',
              fields: [
                {
                  type: 'select',
                  name: 'province',
                  label: 'Provincia',
                  required: false,
                  placeholder: 'Seleccionar provincia',
                  options: PROVINCE_OPTIONS
                },
                {
                  type: 'text',
                  name: 'canton',
                  label: 'Cantón',
                  required: false,
                  placeholder: 'Cantón'
                },
                {
                  type: 'text',
                  name: 'district',
                  label: 'Distrito',
                  required: false,
                  placeholder: 'Distrito'
                },
                {
                  type: 'text',
                  name: 'address',
                  label: 'Dirección',
                  required: false,
                  placeholder: 'Dirección exacta'
                },
                {
                  type: 'text',
                  name: 'professionalTitle',
                  label: 'Título profesional',
                  required: false,
                  placeholder: 'Título profesional'
                },
                {
                  type: 'date',
                  name: 'hireDate',
                  label: 'Fecha de contratación',
                  required: false
                },
                {
                  type: 'text',
                  name: 'condition',
                  label: 'Condición',
                  required: false,
                  placeholder: 'Condición laboral'
                }
              ]
            },
            {
              title: 'Roles y Estado',
              fields: [
                {
                  type: 'custom',
                  name: 'roleIds',
                  label: 'Roles asignados',
                  required: false,
                  helperText: 'Seleccione uno o múltiples roles para el usuario',
                  render: ({ field }) => (
                    <div>
                      {rolesLoading && <p className="text-sm text-gray-500">Cargando roles...</p>}
                      {rolesError && <p className="text-sm text-red-500">Error cargando roles: {rolesError.message}</p>}
                      <FormSelectMultiple
                        label="Roles asignados"
                        value={field.value || []}
                        onChange={field.onChange}
                        options={roleOptions}
                        placeholder={roleOptions.length > 0 ? 'Seleccionar roles...' : 'No hay roles disponibles'}
                      />
                      {/* Debug info */}
                      <p className="text-xs text-gray-400 mt-1">
                        {roleOptions.length} roles cargados: {roleOptions.map((r) => r.name).join(', ')}
                      </p>
                    </div>
                  )
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: STATUS_OPTIONS
                },
                {
                  type: 'text',
                  name: 'photoUrl',
                  label: 'Foto (URL)',
                  required: false,
                  placeholder: 'URL de la foto de perfil'
                },
                {
                  type: 'text',
                  name: 'googleId',
                  label: 'Google ID',
                  required: false,
                  placeholder: 'ID de Google (si aplica)'
                }
              ]
            }
          ]}
        />
      )
    }
    UserCrudForm.displayName = 'UserCrudForm'
    return UserCrudForm
  }, [])

  // Configuración del CRUD
  const crudConfig = useMemo(
    () => ({
      entityName: 'Usuario',
      entityNamePlural: 'Usuarios',
      searchPlaceholder: 'Buscar por nombre, correo o cédula...',
      usePaginatedQuery: usePaginatedUsers,
      useCreateMutation: useCreateUser,
      useUpdateMutation: useUpdateUser,
      useDeleteMutation: useDeleteUser,
      useOneQuery: useUser,
      defaultFormValues: {
        email: '',
        fullName: '',
        fullLastName: '',
        primaryPhone: '',
        photoUrl: '',
        nationalId: '',
        birthDate: null,
        province: '',
        canton: '',
        district: '',
        address: '',
        professionalTitle: '',
        hireDate: null,
        condition: '',
        status: 'ACTIVE',
        googleId: '',
        roleIds: []
      } as unknown as CreateUserInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: UserWithRelations) => {
        let birthDate: Date | null = null
        let hireDate: Date | null = null
        if (item.birthDate) {
          birthDate = typeof item.birthDate === 'string' ? new Date(item.birthDate) : item.birthDate
        }
        if (item.hireDate) {
          hireDate = typeof item.hireDate === 'string' ? new Date(item.hireDate) : item.hireDate
        }
        // Remove relations not handled in the form but keep roleIds
        const { roles, academicLoads, userLanguages, workExperiences, ...rest } = item
        return {
          ...rest,
          birthDate,
          hireDate,
          roleIds: item.roleIds || []
        }
      }
    }),
    [renderForm, renderColumns]
  )

  return (
    <div className="w-full flex justify-center px-4 md:px-6 lg:px-10 py-8">
      <div className="w-full max-w-6xl space-y-8">
        <div className="w-full shadow-md border p-6 space-y-6 rounded-2xl bg-background">
          <PageHeader
            title="Gestión de Usuarios"
            icon={UserCircle2}
            subtitle="Administra los usuarios del sistema, crea, edita y elimina registros fácilmente."
          />
          <CrudModuleBase<UserWithRelations, CreateUserInput, UpdateUserInput> {...crudConfig} />
        </div>
      </div>
    </div>
  )
}

UserCrud.displayName = 'UserCrud'
