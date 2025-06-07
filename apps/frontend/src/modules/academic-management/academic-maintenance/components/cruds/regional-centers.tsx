/* eslint-disable react/display-name */
'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import {
  useCreateRegionalCenter,
  useUpdateRegionalCenter,
  useRemoveRegionalCenter,
  useOneRegionalCenter,
  useListRegionalCentersPaginated
} from '@/modules/academic-management/academic-maintenance/hooks/useRegionalCenter'
import { useRegionalCenterFormData } from '../../hooks/useRegionalCenterFormData'
import {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput
} from '@/modules/academic-management/academic-maintenance/types/regional-center'
import { Status } from '@una-gc/database/prisma/generated/client'
import { Badge, Button } from '@una-gc/ui/components'
import { Building2, Hash, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'

// Define the item type for CrudModuleBase
interface RegionalCenterItem extends RegionalCenterWithRelations {}

// RegionalCenter status options with enhanced icons and descriptions
const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'El centro regional está operativo y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'El centro regional no está operativo y permanecerá oculto'
  }
]

export default function RegionalCentersCrud() {
  // Cargar datos para el formulario
  const { campuses, isLoadingCampuses } = useRegionalCenterFormData()

  // Definición de columnas para la tabla de centros regionales
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<RegionalCenterItem>): ColumnDef<RegionalCenterItem>[] => [
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
            <div className="flex items-center min-w-[140px] max-w-[260px] truncate">
              <Building2 className="h-4 w-4 text-primary mr-2" />
              <span className="font-medium">{row.original.name}</span>
            </div>
          )
        },
        {
          accessorKey: 'campusCount',
          header: 'Número de Campus',
          size: 110,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[60px] max-w-[90px]">
              <span className="font-semibold text-center w-full">{row.original.campuses ? row.original.campuses.length : 0}</span>
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

  // Formulario con campos básicos y relación con campus
  const renderForm = useMemo(() => {
    return ({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) => {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Centro Regional' : 'Crear Nuevo Centro Regional'}
          description={
            isUpdate ? 'Actualice los datos del centro regional' : 'Complete los datos para registrar un nuevo centro regional'
          }
          sections={() => [
            {
              title: 'Datos básicos',
              description: 'Información principal del centro regional',
              icon: <Building2 className="h-5 w-5 text-primary mr-2" />,
              fields: [
                {
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: CR-BRUNCA',
                  helperText: 'Código único del centro regional',
                  rules: {
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
                  required: true,
                  placeholder: 'Ej: Centro Regional Brunca',
                  helperText: 'Nombre completo del centro regional',
                  rules: {
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 100, message: 'El nombre no puede exceder 100 caracteres' }
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
                  helperText: 'Estado actual del centro regional',
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
  }, [campuses, isLoadingCampuses])

  const crudConfig = useMemo(
    () => ({
      entityName: 'Centro Regional',
      entityNamePlural: 'Centros Regionales',
      searchPlaceholder: 'Buscar por código o nombre...',
      usePaginatedQuery: useListRegionalCentersPaginated,
      useCreateMutation: useCreateRegionalCenter,
      useUpdateMutation: useUpdateRegionalCenter,
      useDeleteMutation: useRemoveRegionalCenter,
      useOneQuery: useOneRegionalCenter,
      defaultFormValues: {
        code: '',
        name: '',
        status: Status.ACTIVE
      } as CreateRegionalCenterInput,
      renderForm,
      renderColumns,
      processItemForEditing: (item: RegionalCenterItem) => ({
        code: item.code || '',
        name: item.name || '',
        status: item.status || Status.ACTIVE
      }),
      preDeleteCheck: () => null
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}

RegionalCentersCrud.displayName = 'RegionalCentersCrud'
