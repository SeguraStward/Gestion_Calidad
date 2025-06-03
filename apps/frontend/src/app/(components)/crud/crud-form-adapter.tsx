'use client'

import { ReactNode } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { CrudForm, FormSection } from './crud-form'
import { CrudItemBase } from './crud-types'

// Props para el adaptador de CrudForm
export interface CrudFormAdapterProps<
  TItem extends CrudItemBase,
  TCreateInput extends FieldValues,
  TUpdateInput extends FieldValues = TCreateInput
> {
  // Props recibidas del CrudModuleBase
  control: UseFormReturn<TCreateInput | TUpdateInput>['control']
  errors: UseFormReturn<TCreateInput | TUpdateInput>['formState']['errors']
  isProcessing: boolean
  isUpdate: boolean
  handleCancel: () => void
  handleSubmitForm: () => void
  editingId?: string | null
  editingItem?: TItem | null
  
  // Props adicionales para el CrudForm
  title?: string
  description?: string
  submitButtonText?: string
  cancelButtonText?: string
  footerContent?: ReactNode
  
  // La definición de las secciones del formulario
  sections: (formData: {
    control: UseFormReturn<TCreateInput | TUpdateInput>['control']
    errors: UseFormReturn<TCreateInput | TUpdateInput>['formState']['errors']
    editingItem?: TItem | null
    isUpdate: boolean
  }) => FormSection<TCreateInput | TUpdateInput>[]
}

/**
 * Adaptador que conecta el CrudModuleBase con el CrudForm
 * 
 * Este componente toma los props que CrudModuleBase pasa a renderForm
 * y los adapta para usarlos con el componente CrudForm
 */
export function CrudFormAdapter<
  TItem extends CrudItemBase,
  TCreateInput extends FieldValues,
  TUpdateInput extends FieldValues = TCreateInput
>({
  // Props del CrudModuleBase
  control,
  errors,
  isProcessing,
  isUpdate,
  handleCancel,
  handleSubmitForm,
  editingId,
  editingItem,
  
  // Props para el CrudForm
  title,
  description,
  submitButtonText,
  cancelButtonText,
  footerContent,
  
  // Función que genera las secciones del formulario
  sections
}: CrudFormAdapterProps<TItem, TCreateInput, TUpdateInput>) {
  // Crear un objeto formMethods compatible con CrudForm
  const formMethodsAdapter = {
    control,
    formState: { errors },
    getValues: () => ({}),
    trigger: async () => true,
    // Otros métodos que podrían ser necesarios
  } as unknown as UseFormReturn<TCreateInput | TUpdateInput>
  
  // Generar las secciones del formulario
  const formSections = sections({
    control,
    errors,
    editingItem,
    isUpdate
  })
  
  // Generar títulos predeterminados basados en el estado de edición
  const defaultTitle = isUpdate ? 'Editar registro' : 'Crear nuevo registro'
  
  return (
    <CrudForm
      formMethods={formMethodsAdapter}
      sections={formSections}
      onSubmit={handleSubmitForm}
      onCancel={handleCancel}
      isSubmitting={isProcessing}
      isUpdate={isUpdate}
      title={title || defaultTitle}
      description={description}
      submitButtonText={submitButtonText}
      cancelButtonText={cancelButtonText}
      footerContent={footerContent}
    />
  )
}
