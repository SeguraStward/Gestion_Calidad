'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import {
  useCreateCareer,
  useUpdateCareer,
  useRemoveCareer,
  useOneCareer,
  useListCareersPaginated
} from '@/modules/academic-management/academic-maintenance/hooks/useCareer'
import { useListSchoolsFlat } from '@/modules/academic-management/academic-maintenance/hooks/useSchool'
import { CareerWithRelations, CreateCareerInput } from '@/modules/academic-management/academic-maintenance/types/career'
import { Status } from '@una-gc/database/prisma/generated/client'
import { Badge, Button } from '@una-gc/ui/components'
import { Hash, School as SchoolIcon, BookUser, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface CareerItem extends CareerWithRelations {}

const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'La carrera está operativa y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'La carrera no está operativa y permanecerá oculta'
  }
]

export default function CareerCrud() {
  // Schools for select
  const { data: schools, isLoading: isLoadingSchools } = useListSchoolsFlat()

  // Table columns
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<CareerItem>): ColumnDef<CareerItem>[] => [
        {
          accessorKey: 'code',
          header: 'Código',
          size: 80,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[60px] max-w-[90px]">
              <Hash className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.code}</span>
            </div>
          )
        },
        {
          accessorKey: 'name',
          header: 'Nombre',
          size: 180,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[120px] max-w-[200px] truncate whitespace-nowrap">
              <BookUser className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">{row.original.name}</span>
            </div>
          )
        },
        {
          accessorKey: 'school.name',
          header: 'Escuela',
          size: 140,
          cell: ({ row }) => {
            const name = row.original.school?.name || 'Sin asignar'
            return (
              <div className="flex items-center min-w-[80px] max-w-[140px] truncate whitespace-nowrap">
                <SchoolIcon className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>{name}</span>
              </div>
            )
          }
        },
        {
          accessorKey: 'coursesCount',
          header: 'Cursos',
          size: 70,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[50px]">
              <span className="font-semibold text-center w-full">
                <span className="font-semibold text-center w-full">{row.original.courses ? row.original.courses.length : 0}</span>
              </span>
            </div>
          )
        },
        {
          accessorKey: 'projectsCount', // corregido el typo
          header: 'Proyectos',
          size: 80,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[60px]">
              <span className="font-semibold text-center w-full">{row.original.projects ? row.original.projects.length : 0}</span>
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
                onClick={() => utils.onDelete(row.original.id)}
                disabled={utils.isProcessing}
              >
                {utils.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )
        }
      ],
    []
  )

  // Form sections for create/edit
  const renderForm = useMemo(() => {
    function CareerCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Carrera' : 'Crear Nueva Carrera'}
          description={isUpdate ? 'Actualice los datos de la carrera' : 'Complete los datos para registrar una nueva carrera'}
          sections={() => [
            {
              title: 'Datos de la Carrera',
              description: 'Información principal de la carrera',
              fields: [
                {
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: CAR-001',
                  helperText: 'Código único de la carrera',
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'name',
                  label: 'Nombre',
                  required: true,
                  placeholder: 'Ej: Ingeniería en Sistemas',
                  helperText: 'Nombre completo de la carrera'
                },
                {
                  type: 'select',
                  name: 'schoolId',
                  label: 'Escuela',
                  required: true,
                  options: ((schools || []) as any[]).map((s) => ({ id: s.id, name: s.name || '', status: s.status })),
                  isLoading: isLoadingSchools,
                  placeholder: isLoadingSchools ? 'Cargando escuelas...' : 'Seleccionar escuela',
                  helperText: 'Seleccione la escuela a la que pertenece esta carrera',
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
                  helperText: 'Estado actual de la carrera',
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
    CareerCrudForm.displayName = 'CareerCrudForm'
    return CareerCrudForm
  }, [isLoadingSchools])

  const crudConfig = useMemo(
    () => ({
      entityName: 'Carrera',
      entityNamePlural: 'Carreras',
      searchPlaceholder: 'Buscar por código, nombre o escuela...',
      usePaginatedQuery: useListCareersPaginated,
      useCreateMutation: useCreateCareer,
      useUpdateMutation: useUpdateCareer,
      useDeleteMutation: useRemoveCareer,
      useOneQuery: (id: string, options?: any) => useOneCareer(id, undefined, options),
      defaultFormValues: {
        code: '',
        name: '',
        schoolId: '',
        status: Status.ACTIVE
      } as unknown as CreateCareerInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: CareerItem) => {
        // Solo extraer los campos primitivos, nunca school ni relaciones
        return {
          code: item.code || '',
          name: item.name || '',
          schoolId: item.school?.id || '',
          status: item.status || Status.ACTIVE
        }
      },
      processFormValues: (values: any) => {
        // Limpiar y validar campos
        const code = typeof values.code === 'string' ? values.code.trim() : ''
        const name = typeof values.name === 'string' ? values.name.trim() : ''
        const schoolId = typeof values.schoolId === 'string' ? values.schoolId.trim() : ''
        const status = values.status

        // Solo devolver los campos que espera el backend
        return {
          code,
          name,
          schoolId,
          status
        }
      },
      preDeleteCheck: (item: CareerItem) => {
        // Si tiene cursos asociados, advertir
        if (item.courses && item.courses.length > 0) {
          return 'No se puede eliminar una carrera con cursos asociados.'
        }
        if (item.projects && item.projects.length > 0) {
          return 'No se puede eliminar una carrera con proyectos asociados.'
        }
        return null
      }
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}
