// regional-center-page.tsx
'use client'

// Importar tipos y hooks específicos
import {
  useCreateRegionalCenter,
  useListRegionalCentersPaginated,
  useOneRegionalCenter,
  useRemoveRegionalCenter,
  useUpdateRegionalCenter
} from '@/modules/academic-management/academic-maintenance/hooks/institutional/useRegionalCenter'
import { CrudItemBase, CrudModuleBase, CrudConfig } from '@/app/(components)/crud/crud-module-base'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@una-gc/ui/components' // Removed FormField as Controller is used directly
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form'
import { Building2, Edit3, Save, Trash2, XCircle } from 'lucide-react' // Added icons
import {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput
} from '@/modules/academic-management/academic-maintenance/types/institutional/regional-center'
import { CampusWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/campus' // Use local type
import { Campus as PrismaCampus, Status } from '@una-gc/database/prisma/generated/client' // Corrected import path

// Define a type for the processed campus data
interface ProcessedCampus {
  id: string
  name: string | null
  code: string
  status: Status // Use imported Status enum
  description: string
  version: number
  createdAt: Date
  updatedAt: Date
  createdBy: string | null
  updatedBy: string | null
  regionalCenterId: string
}

// Define a more specific type for the item, extending CrudItemBase
interface RegionalCenterItem extends CrudItemBase, Omit<RegionalCenterWithRelations, 'campuses'> {
  campuses: ProcessedCampus[]
}

// Define Update type
type UpdateRegionalCenterInputType = Partial<CreateRegionalCenterInput>

// Configuración específica para RegionalCenter
const regionalCenterConfig: CrudConfig<RegionalCenterItem, CreateRegionalCenterInput, UpdateRegionalCenterInputType> = {
  entityName: 'Sede Regional',
  entityNamePlural: 'Sedes Regionales',

  usePaginatedQuery: useListRegionalCentersPaginated,
  useCreateMutation: useCreateRegionalCenter,
  useUpdateMutation: useUpdateRegionalCenter,
  useDeleteMutation: useRemoveRegionalCenter,
  useOneQuery: (id: string) => useOneRegionalCenter(id),

  validationRules: {
    code: {
      required: 'Código es requerido',
      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
      maxLength: { value: 15, message: 'Máximo 15 caracteres' }
    },
    name: {
      required: 'Nombre es requerido',
      minLength: { value: 5, message: 'Mínimo 5 caracteres' },
      maxLength: { value: 100, message: 'Máximo 100 caracteres' }
    }
  },

  defaultFormValues: {
    code: '',
    name: ''
  },

  processItem: (item: RegionalCenterWithRelations): RegionalCenterItem => ({
    ...item,
    id: item.id,
    campuses: (item.campuses || []).map(
      (campus: PrismaCampus): ProcessedCampus => ({
        // Use PrismaCampus here
        id: campus.id,
        name: campus.name || 'N/A',
        code: campus.code || 'N/A',
        status: campus.status || Status.ACTIVE, // Use Status enum, provide a default if necessary
        description: campus.description || '',
        version: campus.version || 0,
        createdAt: campus.createdAt ? new Date(campus.createdAt) : new Date(),
        updatedAt: campus.updatedAt ? new Date(campus.updatedAt) : new Date(),
        createdBy: campus.createdBy || null,
        updatedBy: campus.updatedBy || null,
        regionalCenterId: campus.regionalCenterId || item.id
      })
    )
  }),

  preDeleteCheck: (item: RegionalCenterItem) => {
    if (item.campuses?.length > 0) {
      return 'No se puede eliminar porque tiene campus asociados'
    }
    return null
  },

  renderForm: ({
    control,
    errors,
    isProcessing,
    isUpdate,
    handleCancel,
    handleSubmitForm
  }: {
    control: Control<CreateRegionalCenterInput | UpdateRegionalCenterInputType>
    errors: FieldErrors<CreateRegionalCenterInput | UpdateRegionalCenterInputType>
    isProcessing: boolean
    isUpdate: boolean
    handleCancel: () => void
    handleSubmitForm: () => void
  }) => (
    <FormLayout
      title={
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {isUpdate ? 'Editar Sede Regional' : 'Crear Nueva Sede Regional'}
        </div>
      }
      onSubmit={handleSubmitForm}
      className="space-y-4 p-4 border rounded-md"
    >
      <div className="space-y-1">
        <Label htmlFor="code">Código de Sede</Label>
        <Controller
          control={control}
          name="code"
          render={({ field }) => <Input id="code" placeholder="Ej: SR-PACIFICO" {...field} />}
        />
        {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la Sede</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => <Input id="name" placeholder="Ej: Sede Regional Pacífico Central" {...field} />}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
          <XCircle className="mr-2 h-4 w-4" /> Cancelar
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isUpdate ? 'Guardar Cambios' : 'Crear Sede'}
        </Button>
      </div>
    </FormLayout>
  ),

  renderItem: (
    item: RegionalCenterItem,
    {
      onEdit,
      onDelete,
      isProcessing,
      isEditing
    }: {
      onEdit: () => void
      onDelete: () => void
      isProcessing: boolean
      isEditing: boolean
    }
  ) => (
    <div className="p-4 border rounded-md shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription>Código: {item.code}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onEdit} disabled={isProcessing}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete} disabled={isProcessing}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div>
          <h4 className="text-sm font-semibold mb-1">Campus Asociados:</h4>
          {item.campuses?.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {item.campuses.map((campus: ProcessedCampus) => (
                <li key={campus.id}>
                  {campus.name} ({campus.code})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No hay campus asociados.</p>
          )}
        </div>
      </CardContent>
    </div>
  )
}

export default function RegionalCenterPage() {
  return (
    <CrudModuleBase<RegionalCenterItem, CreateRegionalCenterInput, UpdateRegionalCenterInputType> {...regionalCenterConfig} />
  )
}
