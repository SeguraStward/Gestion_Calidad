// types.ts
import { Control, FieldErrors, FieldValues, DefaultValues } from 'react-hook-form'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'

export type CrudPaginationMeta = {
  total: number
  totalPages?: number
  page: number
}

export type CrudItemBase = {
  id: string
  [key: string]: any
}

// Utilities passed to column render functions
export type ColumnUtilities<TItem> = {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isProcessing: boolean
  deleteOperation: UseMutationResult<any, unknown, any>
}

export type CrudConfig<
  TItem extends CrudItemBase,
  TCreateInput extends FieldValues,
  TUpdateInput extends FieldValues = TCreateInput
> = {
  entityName: string
  entityNamePlural?: string
  gender?: 'masculine' | 'feminine'
  usePaginatedQuery: (queryParams: any) => UseQueryResult<{
    data: TItem[]
    meta: CrudPaginationMeta
  }>
  useCreateMutation: () => UseMutationResult<TItem, unknown, TCreateInput>
  useUpdateMutation: () => UseMutationResult<
    TItem,
    unknown,
    { id: string; data: TUpdateInput }
  >
  useDeleteMutation: () => UseMutationResult<void, unknown, string>
  useOneQuery?: (
    id: string,
    options?: { enabled?: boolean; [key: string]: any }
  ) => UseQueryResult<TItem>
  searchPlaceholder?: string
  defaultFormValues: DefaultValues<TCreateInput>
  renderForm: (props: {
    control: Control<TCreateInput | TUpdateInput>
    errors: FieldErrors<TCreateInput | TUpdateInput>
    isProcessing: boolean
    isUpdate: boolean
    handleCancel: () => void
    handleSubmitForm: () => void
    editingId?: string | null
    editingItem?: TItem | null
  }) => React.ReactNode
  // New method for DataTable columns
  renderColumns: (utils: ColumnUtilities<TItem>) => ColumnDef<TItem>[]
  // Old method for list rendering (kept for backward compatibility)
  renderItem?: (
    item: TItem,
    options: {
      isEditing: boolean
      onEdit: () => void
      onDelete: () => void
      isProcessing: boolean
    }
  ) => React.ReactNode
  processItem?: (item: any) => TItem
  processItemForEditing?: (item: TItem) => TUpdateInput
  preDeleteCheck?: (item: TItem) => string | null
}