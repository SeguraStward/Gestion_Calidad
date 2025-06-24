'use client'

import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import { ColumnUtilities, CrudModuleBase } from '@/app/(components)/crud/crud-module-base'
import {
  useCreateFaculty,
  useListFacultiesPaginated,
  useOneFaculty,
  useRemoveFaculty,
  useUpdateFaculty
} from '@/modules/academic-management/academic-maintenance/hooks/useFaculty'
import { CreateFacultyInput, FacultyWithRelations } from '@/modules/academic-management/academic-maintenance/types/faculty'
import { Status } from '@/shared/types/status'
import { ColumnDef } from '@tanstack/react-table'
import { Badge, Button } from '@una-gc/ui/components'
import { CheckCircle2, GraduationCap, Hash, Loader2, Pencil, Trash2, XCircle } from 'lucide-react'
import { useMemo } from 'react'

// Define the item type for CrudModuleBase
interface FacultyItem extends FacultyWithRelations {}

// Faculty status options with enhanced icons and descriptions
const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'La facultad está operativa y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'La facultad no está operativa y permanecerá oculta'
  }
]

export default function FacultyCrud() {
  // Definición de columnas para la tabla de facultades
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities): ColumnDef<FacultyItem>[] => [
        {
          accessorKey: 'code',
          header: 'Código',
          size: 120,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[90px] max-w-[160px] truncate">
              <Hash className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.code}</span>
            </div>
          )
        },
        {
          accessorKey: 'name',
          header: 'Nombre',
          size: 220,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[140px] max-w-[260px] truncate whitespace-nowrap">
              <GraduationCap className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium truncate">{row.original.name}</span>
            </div>
          )
        },
        {
          accessorKey: 'description',
          header: 'Descripción',
          size: 250,
          cell: ({ row }) => <div className="truncate max-w-xs">{row.original.description}</div>
        },
        {
          accessorKey: 'schoolCount',
          header: 'Número de Escuelas',
          size: 110,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[60px] max-w-[90px]">
              <span className="font-semibold text-center w-full">{row.original.schools ? row.original.schools.length : 0}</span>
            </div>
          )
        },
        {
          accessorKey: 'status',
          header: 'Estado',
          size: 110,
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
                {utils.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )
        }
      ],
    []
  )

  // Formulario con campos básicos
  const renderForm = useMemo(() => {
    const FormComponent = ({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) => {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Facultad' : 'Crear Nueva Facultad'}
          description={isUpdate ? 'Actualice los datos de la facultad' : 'Complete los datos para registrar una nueva facultad'}
          sections={() => [
            {
              title: 'Datos básicos',
              description: 'Información principal de la facultad',
              icon: <GraduationCap className="h-5 w-5 text-primary mr-2" />,
              fields: [
                {
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: FCTEC',
                  helperText: 'Código único de la facultad',
                  rules: {
                    required: { value: true, message: 'El código es requerido' },
                    minLength: { value: 2, message: 'El código debe tener al menos 2 caracteres' },
                    maxLength: { value: 20, message: 'El código no puede exceder 20 caracteres' },
                    pattern: { value: /^[A-Za-z0-9\-_]+$/, message: 'Solo letras, números, guiones y guiones bajos' }
                  },
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'name',
                  label: 'Nombre',
                  required: false,
                  placeholder: 'Ej: Facultad de Ciencias',
                  helperText: 'Nombre completo de la facultad (opcional)',
                  rules: {
                    required: { value: true, message: 'El nombre es requerido' },
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 100, message: 'El nombre no puede exceder 100 caracteres' }
                  }
                },
                {
                  type: 'text',
                  name: 'description',
                  label: 'Descripción',
                  required: false,
                  placeholder: 'Descripción de la facultad',
                  helperText: 'Breve descripción de la facultad (opcional)',
                  rules: {
                    minLength: { value: 3, message: 'La descripción debe tener al menos 3 caracteres' },
                    maxLength: { value: 200, message: 'La descripción no puede exceder 200 caracteres' }
                  }
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: STATUS_OPTIONS.map((option) => ({
                    id: option.id,
                    name: option.name
                  })),
                  helperText: 'Estado actual de la facultad',
                  rules: {
                    required: { value: true, message: 'El estado es requerido' }
                  },
                  renderOption: (option: any) => (
                    <div className="flex items-center">
                      {STATUS_OPTIONS.find((opt) => opt.id === option.id)?.icon}
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
    FormComponent.displayName = 'FacultyCrudForm'
    return FormComponent
  }, [])

  // Adapter to match CrudModuleBase's expected useOneQuery signature
  const useOneFacultyAdapter = (id: string, options?: { [key: string]: any; enabled?: boolean }) => {
    return useOneFaculty(id, undefined, options)
  }

  const crudConfig = useMemo(
    () => ({
      entityName: 'Facultad',
      entityNamePlural: 'Facultades',
      searchPlaceholder: 'Buscar por código, nombre o descripción...',
      usePaginatedQuery: useListFacultiesPaginated, // Pasa el hook directamente
      useCreateMutation: useCreateFaculty,
      useUpdateMutation: useUpdateFaculty,
      useDeleteMutation: useRemoveFaculty,
      useOneQuery: useOneFacultyAdapter,
      defaultFormValues: {
        code: '',
        name: '', // Opcional, puede estar vacío
        description: '', // Opcional, puede estar vacío
        status: Status.ACTIVE
      } as CreateFacultyInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: FacultyItem) => ({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        status: item.status || Status.ACTIVE
      }),
      preDeleteCheck: (item: FacultyItem) => {
        if (item.schools && item.schools.length > 0) {
          return 'No se puede eliminar una facultad con escuelas asociadas.'
        }
        return null
      }
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}

FacultyCrud.displayName = 'FacultyCrud'
