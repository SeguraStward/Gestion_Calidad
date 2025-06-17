// Campus CRUD datatable and form using form-adapter
'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import {
  useCreateCampus,
  useUpdateCampus,
  useRemoveCampus,
  useOneCampus,
  useListCampusesPaginated
} from '@/shared/hooks/useCampus'
import { useListRegionalCentersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useRegionalCenter'
import { CampusWithRelations, CreateCampusInput } from '@/shared/types/campus'
import { Status } from '@/shared/types/status'
import { Badge, Button } from '@una-gc/ui/components'
import { Loader2, Hash, Building2, Globe, MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'

// Status options for select
const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'El campus está operativo y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'El campus no está operativo y permanecerá oculto'
  }
]

interface CampusItem extends CampusWithRelations {}
type UpdateCampusInput = Partial<CreateCampusInput>

export default function CampusCrud() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useRemoveCampus()

  // Regional centers for select (traer todos, sin paginación)
  const { data: regionalCenters = [], isLoading: isLoadingRegionalCenters } = useListRegionalCentersFlat()

  // Table columns
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<CampusItem>): ColumnDef<CampusItem>[] => [
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
              <Building2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
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
          accessorKey: 'regionalCenter.name',
          header: 'Sede Regional',
          size: 140,
          cell: ({ row }) => {
            const name = row.original.regionalCenter?.name || 'Sin asignar'
            return (
              <div className="flex items-center min-w-[80px] max-w-[140px] truncate whitespace-nowrap">
                <Globe className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>{name}</span>
              </div>
            )
          }
        },
        {
          accessorKey: 'classroomCount',
          header: () => <span>Aulas</span>,
          size: 70,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[50px]">
              <span className="font-semibold text-center w-full">
                {row.original.classrooms ? row.original.classrooms.length : 0}
              </span>
            </div>
          )
        },
        {
          accessorKey: 'academicLoadCount',
          header: () => <span>Cargas Académicas</span>,
          size: 90,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[60px]">
              <span className="font-semibold text-center w-full">
                {row.original.academicLoads ? row.original.academicLoads.length : 0}
              </span>
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
                disabled={deleteMutation.isPending && deleteId === row.original.id}
              >
                {deleteMutation.isPending && deleteId === row.original.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
        }
      ],
    [deleteId, deleteMutation]
  )

  // Form sections for create/edit
  const renderForm = useMemo(() => {
    function CampusCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Campus' : 'Crear Nuevo Campus'}
          description={isUpdate ? 'Actualice los datos del campus' : 'Complete los datos para registrar un nuevo campus'}
          sections={() => [
            {
              title: 'Datos del Campus',
              description: 'Información principal del campus',
              fields: [
                {
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: CAMP-001',
                  helperText: 'Código único del campus',
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'name',
                  label: 'Nombre',
                  required: true,
                  placeholder: 'Ej: Campus Central',
                  helperText: 'Nombre completo del campus'
                },
                {
                  type: 'text',
                  name: 'description',
                  label: 'Descripción',
                  required: true,
                  placeholder: 'Descripción del campus',
                  helperText: 'Breve descripción del campus'
                },
                {
                  type: 'select',
                  name: 'regionalCenterId', // Cambiado a regionalCenterId
                  label: 'Sede Regional',
                  required: true,
                  // Pass the full regional center object for status rendering
                  options: (regionalCenters || []).map((rc: any) => ({
                    id: rc.id,
                    name: rc.name,
                    status: rc.status
                  })),
                  isLoading: isLoadingRegionalCenters,
                  placeholder: isLoadingRegionalCenters ? 'Cargando sedes...' : 'Seleccionar sede regional',
                  helperText: 'Seleccione la sede regional a la que pertenece este campus',
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
                  helperText: 'Estado actual del campus',
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
    CampusCrudForm.displayName = 'CampusCrudForm'
    return CampusCrudForm
  }, [regionalCenters, isLoadingRegionalCenters])

  const crudConfig = useMemo(
    () => ({
      entityName: 'Campus',
      entityNamePlural: 'Campus',
      searchPlaceholder: 'Buscar por código, nombre o sede...',
      usePaginatedQuery: useListCampusesPaginated,
      useCreateMutation: useCreateCampus,
      useUpdateMutation: useUpdateCampus,
      useDeleteMutation: useRemoveCampus,
      useOneQuery: (id: string, options?: any) => useOneCampus(id, undefined, options),
      defaultFormValues: {
        code: '',
        name: '',
        description: '',
        regionalCenterId: '', // Cambiado a regionalCenterId
        status: Status.ACTIVE
      } as unknown as CreateCampusInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: CampusItem) => ({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        regionalCenterId: item.regionalCenter?.id || '', // Cambiado a regionalCenterId
        status: item.status || Status.ACTIVE
      }),
      processFormValues: (values: any) => ({
        ...values,
        regionalCenterId: values.regionalCenterId // Asegura que se envía regionalCenterId
      }),
      preDeleteCheck: (item: CampusItem) => {
        if (item.classrooms && item.classrooms.length > 0) {
          return 'No se puede eliminar un campus con aulas asociadas.'
        }
        if (item.academicLoads && item.academicLoads.length > 0) {
          return 'No se puede eliminar un campus con cargas académicas asociadas.'
        }
        return null
      }
    }),
    [renderForm, renderColumns]
  )

  // Obtener la fila seleccionada para eliminar
  // (opcional, para mostrar nombre en el modal)
  // const selectedRow = (campuses || []).find((item: CampusItem) => item.id === deleteId)

  return (
    <>
      <CrudModuleBase {...crudConfig} />
      {/* AlertMessage eliminado, ya lo maneja CrudModuleBase */}
    </>
  )
}

CampusCrud.displayName = 'CampusCrud'
