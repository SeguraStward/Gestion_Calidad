'use client'

import { useListCampuses, useOneCampus, useCreateCampus, useUpdateCampus, useRemoveCampus } from '../../hooks/useCampus'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import { useListClassrooms, useOneClassroom, useCreateClassroom, useUpdateClassroom, useRemoveClassroom } from '@/modules/academic-management/academic-maintenance/hooks/useClassrooms'
import { ClassroomWithRelations, CreateClassroomInput } from '@/shared/types/classroom'
import { Status } from '@una-gc/database/prisma/generated/client'
import { Badge, Button } from '@una-gc/ui/components'
import { School as SchoolIcon, Hash, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface ClassroomItem extends ClassroomWithRelations {}

const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'El aula está operativa y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'El aula no está operativa y permanecerá oculta'
  }
]

export default function ClassroomCrud() {
  // Campus para el select
  const { data: campuses, isLoading: isLoadingCampuses } = useListCampuses()

  // Columnas de la tabla
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<ClassroomItem>): ColumnDef<ClassroomItem>[] => [
        {
          accessorKey: 'roomNumber',
          header: 'Aula',
          size: 120,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[90px] max-w-[160px] truncate">
              <Hash className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span>{row.original.roomNumber}</span>
            </div>
          )
        },
        {
          accessorKey: 'capacity',
          header: 'Capacidad',
          size: 100,
          cell: ({ row }) => <span>{row.original.capacity}</span>
        },
        {
          accessorKey: 'description',
          header: 'Descripción',
          size: 200,
          cell: ({ row }) => <div className="truncate max-w-xs">{row.original.description}</div>
        },
        {
          accessorKey: 'campus.name',
          header: 'Campus',
          size: 180,
          cell: ({ row }) => {
            // Solo soporta campus (según DTO y types)
            const name = row.original.campus?.name || 'Sin asignar';
            return (
              <div className="flex items-center min-w-[140px] max-w-[260px] truncate whitespace-nowrap">
                <Hash className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>{name}</span>
              </div>
            );
          }
        },
        {
          accessorKey: 'status',
          header: 'Estado',
          size: 100,
          cell: ({ row }) => {
            // Normaliza el status a string para evitar errores de comparación
            const statusStr = String(row.original.status).toUpperCase()
            let badgeClasses = ''
            let statusText = ''
            if (statusStr === 'ACTIVE') {
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
    [campuses]
  )

  // Formulario para crear/editar
  const renderForm = useMemo(() => {
    function ClassroomCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Aula' : 'Crear Nueva Aula'}
          description={isUpdate ? 'Actualice los datos del aula' : 'Complete los datos para registrar una nueva aula'}
          sections={() => [
            {
              title: 'Datos del Aula',
              description: 'Información principal del aula',
              fields: [
                {
                  type: 'text',
                  name: 'roomNumber',
                  label: 'Número de Aula',
                  required: true,
                  placeholder: 'Ej: A-101',
                  helperText: 'Identificador único del aula'
                },
                {
                  type: 'number',
                  name: 'capacity',
                  label: 'Capacidad',
                  required: true,
                  placeholder: 'Ej: 35',
                  helperText: 'Cantidad máxima de estudiantes'
                },
                {
                  type: 'text',
                  name: 'description',
                  label: 'Descripción',
                  required: false,
                  placeholder: 'Descripción del aula',
                  helperText: 'Breve descripción del aula'
                },
                {
                  type: 'select',
                  name: 'campusId',
                  label: 'Campus',
                  required: true,
                  options: (campuses || []).map((c) => ({ id: c.id, name: c.name || '' })),
                  isLoading: isLoadingCampuses,
                  placeholder: isLoadingCampuses ? 'Cargando campus...' : 'Seleccionar campus',
                  helperText: 'Seleccione el campus al que pertenece este aula'
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: STATUS_OPTIONS,
                  helperText: 'Estado actual del aula',
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
    ClassroomCrudForm.displayName = 'ClassroomCrudForm'
    return ClassroomCrudForm
  }, [campuses, isLoadingCampuses])

  // Adapter to match expected signature for useOneQuery
  const useOneClassroomAdapter = (id: string, options?: { [key: string]: any }) => {
    // Ignore filters, only pass id and options to the original hook
    return useOneClassroom(id, undefined, options)
  }

  const crudConfig = useMemo(
    () => ({
      entityName: 'Aula',
      entityNamePlural: 'Aulas',
      searchPlaceholder: 'Buscar por número, descripción o campus...',
      usePaginatedQuery: useListClassrooms,
      useCreateMutation: useCreateClassroom,
      useUpdateMutation: useUpdateClassroom,
      useDeleteMutation: useRemoveClassroom,
      useOneQuery: useOneClassroomAdapter,
      defaultFormValues: {
        roomNumber: '',
        capacity: 0,
        description: '',
        campusId: '',
        status: Status.ACTIVE
      } as unknown as CreateClassroomInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: ClassroomItem) => ({
        roomNumber: item.roomNumber || '',
        capacity: item.capacity || 0,
        description: item.description || '',
        campusId: item.campus?.id || '',
        status: item.status || Status.ACTIVE
      }),
      processFormValues: (values: any) => ({
        ...values,
        campusId: values.campusId
      })
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}
