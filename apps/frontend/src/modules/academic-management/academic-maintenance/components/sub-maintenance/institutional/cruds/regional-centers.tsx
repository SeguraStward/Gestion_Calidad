/* eslint-disable react/display-name */
'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { 
  CrudModuleBase, 
  ColumnUtilities 
} from '@/app/(components)/crud/crud-module-base'
import { 
  CrudFormAdapter 
} from '@/app/(components)/crud/crud-form-adapter'
import { 
  useCreateRegionalCenter,
  useUpdateRegionalCenter,
  useRemoveRegionalCenter,
  useOneRegionalCenter,
  useListRegionalCenters,
  useListRegionalCentersPaginated
} from '@/modules/academic-management/academic-maintenance/hooks/institutional/useRegionalCenter'
import { useRegionalCenterFormData } from '../../../../hooks/institutional/useRegionalCenterFormData'
import { 
  RegionalCenterWithRelations, 
  CreateRegionalCenterInput,
  CampusSelectOption
} from '@/modules/academic-management/academic-maintenance/types/institutional/regional-center'
import { Status } from '@una-gc/database/prisma/generated/client'
import { 
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@una-gc/ui/components'
import { 
  Building2,
  MapPin,
  Calendar,
  Hash,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Globe,
  Mail,
  Phone,
  Map,
  Users,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { AlertMessage } from '@/app/(components)/ui/alert-message'

// Define the item type for CrudModuleBase
interface RegionalCenterItem extends RegionalCenterWithRelations {}

// Define the update input type
type UpdateRegionalCenterInput = Partial<CreateRegionalCenterInput>;

// RegionalCenter status options with enhanced icons and descriptions
const STATUS_OPTIONS = [
  { 
    id: Status.ACTIVE, 
    name: "Activo", 
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: "El centro regional está operativo y visible en el sistema" 
  },
  { 
    id: Status.INACTIVE, 
    name: "Inactivo", 
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: "El centro regional no está operativo y permanecerá oculto" 
  }
];

export default function RegionalCentersCrud() {
  // Cargar datos para el formulario
  const { campuses, isLoadingCampuses } = useRegionalCenterFormData();

  // Definición de columnas para la tabla de centros regionales
  const renderColumns = useMemo(() => (
    (utils: ColumnUtilities<RegionalCenterItem>): ColumnDef<RegionalCenterItem>[] => [
      {
        accessorKey: 'code',
        header: 'Código',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Hash className="h-4 w-4 text-primary mr-2" />
            <span>{row.original.code}</span>
          </div>
        )
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        )
      },
      {
        accessorKey: 'campuses.0.name',
        header: 'Campus',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-primary mr-2" />
            <span>{row.original.campuses?.[0]?.name || 'Sin campus'}</span>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        size: 100,
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeClasses = "";
          let statusText = "";
          if (status === Status.ACTIVE) {
            badgeClasses = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            statusText = "Activo";
          } else {
            badgeClasses = "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800";
            statusText = "Inactivo";
          }
          return (
            <Badge variant="outline" className={badgeClasses}>
              {statusText}
            </Badge>
          );
        }
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="text-right flex gap-1 justify-end">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => utils.onEdit(row.original.id)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertMessage
              title="¿Desea eliminar el centro regional?"
              description={`Esta acción no se puede deshacer. ¿Eliminar "${row.original.name}"?`}
              variant="danger"
              confirmText="Eliminar"
              cancelText="Cancelar"
              onConfirm={() => {
                utils.onDelete(row.original.id);
              }}
              trigger={
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                  title="Eliminar"
                  disabled={utils.isProcessing}
                >
                  {utils.isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              }
            />
          </div>
        )
      }
    ]
  ), []);

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
          description={isUpdate ? 'Actualice los datos del centro regional' : 'Complete los datos para registrar un nuevo centro regional'}
          sections={() => [{
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
                name: 'campusId',
                label: 'Campus',
                required: true,
                options: campuses.map((campus: CampusSelectOption) => ({
                  id: campus.id,
                  name: campus.name
                })),
                isLoading: isLoadingCampuses,
                placeholder: 'Seleccionar campus',
                helperText: 'Campus al que pertenece el centro regional'
              },
              {
                type: 'select',
                name: 'status',
                label: 'Estado',
                required: true,
                options: STATUS_OPTIONS.map(option => ({
                  id: option.id,
                  name: option.name
                })),
                helperText: 'Estado actual del centro regional',
                renderOption: (option: any) => (
                  <div className="flex items-center">
                    {STATUS_OPTIONS.find(opt => opt.id === option.id)?.icon}
                    <span>{option.name}</span>
                  </div>
                )
              }
            ]
          }]}
        />
      );
    };
  }, [campuses, isLoadingCampuses]);

  const crudConfig = useMemo(() => ({
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
      campusId: '',
      status: Status.ACTIVE
    } as CreateRegionalCenterInput,
    renderForm,
    renderColumns,
    processItemForEditing: (item: RegionalCenterItem) => ({
      code: item.code || '',
      name: item.name || '',
      campusId: item.campuses?.[0]?.id || '',
      status: item.status || Status.ACTIVE
    }),
    preDeleteCheck: () => null,
  }), [renderForm, renderColumns]);

  return <CrudModuleBase {...crudConfig} />;
}

RegionalCentersCrud.displayName = 'RegionalCentersCrud';