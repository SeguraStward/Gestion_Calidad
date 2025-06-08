'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import {
  useCreateSchool,
  useUpdateSchool,
  useRemoveSchool,
  useOneSchool,
  useListSchoolsPaginated
} from '@/modules/academic-management/academic-maintenance/hooks/useSchool'
import { useListFacultiesFlat } from '@/modules/academic-management/academic-maintenance/hooks/useFaculty'
import { SchoolWithRelations, CreateSchoolInput } from '@/modules/academic-management/academic-maintenance/types/school'
import { Status } from '@una-gc/database/prisma/generated/client'
import { Badge, Button } from '@una-gc/ui/components'
import {
  School as SchoolIcon,
  BookUser,
  Award,
  Hash,
  GraduationCap,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface SchoolItem extends SchoolWithRelations {}
//FIXED

const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'La escuela está operativa y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'La escuela no está operativa y permanecerá oculta'
  }
]

export default function SchoolCrud() {
  // Faculties for select
  const { data: faculties, isLoading: isLoadingFaculties } = useListFacultiesFlat()

  // Table columns
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<SchoolItem>): ColumnDef<SchoolItem>[] => [
        {
          accessorKey: 'code',
          header: 'Código',
          size: 90,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[60px] max-w-[100px]">
              <Hash className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.code}</span>
            </div>
          )
        },
        {
          accessorKey: 'name',
          header: 'Nombre',
          size: 160,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[100px] max-w-[180px] truncate whitespace-nowrap">
              <SchoolIcon className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">{row.original.name}</span>
            </div>
          )
        },
        {
          accessorKey: 'description',
          header: 'Descripción',
          size: 180,
          cell: ({ row }) => <div className="truncate max-w-[160px]">{row.original.description}</div>
        },
        {
          accessorKey: 'faculty.name',
          header: 'Facultad',
          size: 140,
          cell: ({ row }) => {
            const name = row.original.faculty?.name || 'Sin asignar'
            return (
              <div className="flex items-center min-w-[80px] max-w-[140px] truncate whitespace-nowrap">
                <GraduationCap className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>{name}</span>
              </div>
            )
          }
        },
        {
          accessorKey: 'careerCount',
          header: 'Carreras',
          size: 80,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[40px] max-w-[60px]">
              <span className="font-semibold text-center w-full">{row.original.careers ? row.original.careers.length : 0}</span>
            </div>
          )
        },
        {
          accessorKey: 'status',
          header: 'Estado',
          size: 80,
          cell: ({ row }) => {
            const status = row.original.status
            let badgeClasses = ''
            let statusText = ''
            if (status === Status.ACTIVE) {
              badgeClasses =
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              statusText = 'Activo'
            } else {
              badgeClasses = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800'
              statusText = 'Inactivo'
            }
            return (
              <Badge variant="outline" className={badgeClasses}>
                {statusText}
              </Badge>
            )
          }
        },
        {
          id: 'actions',
          header: () => <div className="text-right">Acciones</div>,
          size: 80,
          cell: ({ row }) => (
            <div className="text-right flex gap-1 justify-end">
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => utils.onEdit(row.original.id)} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Eliminar"
                onClick={() => utils.onDelete(row.original.id)}
                disabled={utils.isProcessing}
              >
                {utils.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )
        }
      ],
    [faculties]
  )

  // Form sections for create/edit
  const renderForm = useMemo(() => {
    function SchoolCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Escuela' : 'Crear Nueva Escuela'}
          description={isUpdate ? 'Actualice los datos de la escuela' : 'Complete los datos para registrar una nueva escuela'}
          sections={() => [
            {
              title: 'Datos de la Escuela',
              description: 'Información principal de la escuela',
              fields: [
                {
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: ESC-001',
                  helperText: 'Código único de la escuela',
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'name',
                  label: 'Nombre',
                  required: true,
                  placeholder: 'Ej: Escuela de Informática',
                  helperText: 'Nombre completo de la escuela'
                },
                {
                  type: 'text',
                  name: 'description',
                  label: 'Descripción',
                  required: false,
                  placeholder: 'Descripción de la escuela',
                  helperText: 'Breve descripción de la escuela'
                },
                {
                  type: 'select',
                  name: 'facultyId',
                  label: 'Facultad',
                  required: true,
                  // Pass the full faculty object for status rendering
                  options: (faculties || []).map((f: any) => ({ id: f.id, name: f.name || '', status: f.status })),
                  isLoading: isLoadingFaculties,
                  placeholder: isLoadingFaculties ? 'Cargando facultades...' : 'Seleccionar facultad',
                  helperText: 'Seleccione la facultad a la que pertenece esta escuela',
                  renderOption: (option: any) => (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${option.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}
                      ></span>
                      <span>{option.name}</span>
                      <span className={`ml-2 text-xs ${option.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {option.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: STATUS_OPTIONS,
                  helperText: 'Estado actual de la escuela',
                  renderOption: (option: any) => (
                    <div className="flex items-center">
                      {option.icon}
                      <span>{option.name}</span>
                    </div>
                  )
                }
              ]
            }
          ]}
        />
      )
    }
    SchoolCrudForm.displayName = 'SchoolCrudForm'
    return SchoolCrudForm
  }, [faculties, isLoadingFaculties])

  const crudConfig = useMemo(
    () => ({
      entityName: 'Escuela',
      entityNamePlural: 'Escuelas',
      searchPlaceholder: 'Buscar por código, nombre o facultad...',
      usePaginatedQuery: useListSchoolsPaginated,
      useCreateMutation: useCreateSchool,
      useUpdateMutation: useUpdateSchool,
      useDeleteMutation: useRemoveSchool,
      useOneQuery: (id: string, options?: any) => useOneSchool(id, undefined, options),
      defaultFormValues: {
        code: '',
        name: '',
        description: '',
        facultyId: '',
        status: Status.ACTIVE
      } as unknown as CreateSchoolInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: SchoolItem) => ({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        facultyId: item.faculty?.id || '',
        status: item.status || Status.ACTIVE
      }),
      processFormValues: (values: any) => ({
        ...values,
        facultyId: values.facultyId
      }),
      preDeleteCheck: (item: SchoolItem) => {
        // Si tiene carreras asociadas, advertir
        if (item.careers && item.careers.length > 0) {
          return 'No se puede eliminar una escuela con carreras asociadas.'
        }
        return null
      }
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}
