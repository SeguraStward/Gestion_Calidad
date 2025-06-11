'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { usePagination } from '../../../shared/hooks/usePagination'
import { Button, Card, CardContent } from '@una-gc/ui/components'
import { CrudConfig, CrudItemBase, ColumnUtilities } from './crud-types'
import { AlertMessage } from '../ui/alert-message'
import { DataTable } from '../ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2, PlusCircle } from 'lucide-react'

export type { ColumnUtilities }

export const CrudModuleBase = <
  TItem extends CrudItemBase,
  TCreateInput extends FieldValues,
  TUpdateInput extends FieldValues = TCreateInput
>(
  props: CrudConfig<TItem, TCreateInput, TUpdateInput>
) => {
  const {
    entityName,
    entityNamePlural = `${entityName}s`,
    usePaginatedQuery,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
    useOneQuery,
    defaultFormValues,
    renderForm,
    renderColumns,
    processItem,
    processItemForEditing,
    processFormValues,
    preDeleteCheck,
    searchPlaceholder = `Buscar ${entityNamePlural.toLowerCase()}...`
  } = props
  const [editingId, setEditingId] = useState<string | null>(null)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previousTotalItems, setPreviousTotalItems] = useState<number | undefined>(undefined)
  const useSafeOneQuery = useOneQuery ?? (() => ({ data: undefined, isLoading: false }))
  // Always call useOneQuery unconditionally to comply with React rules of hooks
  const { data: editingItemData, isLoading: isLoadingEditingItem } = useSafeOneQuery(
    editingId !== 'new' && editingId ? editingId : '',
    { enabled: !!useOneQuery && !!editingId && editingId !== 'new' }
  )

  // Procesar el elemento para edición si existe processItemForEditing
  const editingItem = useMemo(() => {
    if (!editingId || editingId === 'new') return null
    if (!editingItemData) return null
    return processItemForEditing ? processItemForEditing(editingItemData) : editingItemData
  }, [editingId, editingItemData, processItemForEditing])

  // Paginación
  const { currentPage, setCurrentPage, itemsPerPage, queryParams } = usePagination()
  const { data: paginatedData, refetch, isLoading: isLoadingList } = usePaginatedQuery(queryParams)

  // Sincronizar página con backend
  useEffect(() => {
    if (paginatedData?.meta?.page && paginatedData.meta.page !== currentPage) {
      setCurrentPage(paginatedData.meta.page)
    }
  }, [paginatedData?.meta?.page, currentPage, setCurrentPage])

  // Manejar actualización de paginación al crear items
  useEffect(() => {
    if (previousTotalItems === undefined && paginatedData?.meta?.total) {
      setPreviousTotalItems(paginatedData.meta.total)
      return
    }

    if (previousTotalItems !== undefined && paginatedData?.meta?.total && paginatedData.meta.total > previousTotalItems) {
      const newTotalPages = paginatedData.meta.totalPages || Math.ceil(paginatedData.meta.total / itemsPerPage)
      // Siempre ir a la última página cuando se crea un nuevo registro
      setCurrentPage(newTotalPages)
    }

    if (paginatedData?.meta?.total) {
      setPreviousTotalItems(paginatedData.meta.total)
    }
  }, [paginatedData?.meta?.total, previousTotalItems, itemsPerPage, paginatedData?.meta?.totalPages, setCurrentPage])
  // Formulario
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TCreateInput | TUpdateInput>({
    defaultValues: defaultFormValues as any,
    mode: 'onChange',
    values: (editingItem || defaultFormValues) as TCreateInput | TUpdateInput | undefined // <-- Esto asegura que los valores del item se muestren en el form
  })

  // Mutaciones
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  // Procesar items
  const processedItems = useMemo(() => {
    // LOG para depuración de datos crudos y procesados
    console.log('PAGINATED DATA:', paginatedData)
    const items = processItem ? (paginatedData?.data || []).map(processItem) : (paginatedData?.data as TItem[]) || []
    console.log('PROCESSED ITEMS:', items)
    return items
  }, [paginatedData?.data, processItem]) // Manejar envío de formulario

  const handleSubmitForm = handleSubmit(async (formData) => {
    setIsProcessing(true)
    try {
      // Sanitizar campos relacionales antes de enviar
      const sanitizedData: Record<string, any> = { ...formData }
      Object.keys(sanitizedData).forEach((key) => {
        if (
          key.endsWith('Id') &&
          (sanitizedData[key] === '' || sanitizedData[key] === undefined || sanitizedData[key] === 'undefined')
        ) {
          sanitizedData[key] = null
        }
      })

      // Procesar los valores si existe la función processFormValues
      const processedData = processFormValues ? processFormValues(sanitizedData as any) : sanitizedData

      if (editingId && editingId !== 'new') {
        // Conversión segura utilizando unknown como intermediario
        // Si no se ha editado nada, usar los valores actuales del item
        let updateData = {
          ...editingItem,
          ...processedData
        } as unknown as TUpdateInput

        await updateMutation.mutateAsync({ id: editingId, data: updateData })
      } else {
        await createMutation.mutateAsync(processedData as TCreateInput)
      }

      // Refrescar datos
      await refetch()

      // Limpiar el formulario y cerrar panel de edición
      setEditingId(null)
      reset(defaultFormValues)
    } catch (error: any) {
      console.error('Error al guardar:', error)
      toast.error(error?.response?.data?.message || error?.message || `Error al guardar ${entityName.toLowerCase()}`)
    } finally {
      setIsProcessing(false)
    }
  })
  // Manejar eliminación
  const handleDelete = async () => {
    if (!idToDelete) return
    setIsProcessing(true)

    try {
      // Buscar el item a eliminar
      const item = processedItems.find((i) => i.id === idToDelete)

      // Verificar si hay restricciones para eliminar
      if (preDeleteCheck && item) {
        const errorMessage = preDeleteCheck(item)
        if (errorMessage) {
          toast.error(errorMessage)
          setIdToDelete(null)
          setIsProcessing(false)
          return
        }
      }

      // Proceder con la eliminación
      await deleteMutation.mutateAsync(idToDelete)
      // toast.success(`${entityName} eliminado exitosamente`) // Eliminado para centralizar en generic hook

      // Refrescar datos
      await refetch()

      // Ajustar paginación si es necesario
      if (processedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error: any) {
      console.error('Error al eliminar:', error)
      toast.error(error?.response?.data?.message || error?.message || `Error al eliminar ${entityName.toLowerCase()}`)
    } finally {
      setIdToDelete(null)
      setIsProcessing(false)
    }
  }

  // Preparar utilidades para las columnas
  const columnUtils = useMemo(
    () => ({
      onEdit: (id: string) => setEditingId(id),
      onDelete: (id: string) => setIdToDelete(id),
      isProcessing,
      deleteOperation: deleteMutation
    }),
    [isProcessing, deleteMutation]
  )

  // Obtener columnas de renderColumns
  const columns: ColumnDef<TItem>[] = useMemo(() => {
    return renderColumns(columnUtils)
  }, [renderColumns, columnUtils])

  // Crear botón de nuevo
  const newButton = (
    <Button onClick={() => setEditingId('new')}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Nuevo {entityName}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de {entityNamePlural}</h1>
      </div>
      {editingId && (
        <Card className="mb-6">
          <CardContent className="p-6">
            {isLoadingEditingItem && editingId !== 'new' ? (
              <div className="flex justify-center p-6">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-3">Cargando datos...</span>
              </div>
            ) : (
              renderForm({
                control,
                errors,
                isProcessing,
                isUpdate: editingId !== 'new',
                handleCancel: () => {
                  setEditingId(null)
                  reset(defaultFormValues as any)
                },
                handleSubmitForm: handleSubmitForm,
                editingId: editingId !== 'new' ? editingId : null,
                editingItem: editingItem as any // Necesario para manejar la discrepancia de tipos
              })
            )}
          </CardContent>
        </Card>
      )}
      <DataTable
        columns={columns}
        data={processedItems}
        searchPlaceholder={searchPlaceholder}
        newButton={!editingId ? newButton : undefined}
        isLoading={isLoadingList}
        currentPage={paginatedData?.meta?.page || 1}
        totalPages={paginatedData?.meta?.totalPages || 1}
        onPageChange={(page) => {
          if (page >= 1 && page <= (paginatedData?.meta?.totalPages || 1)) {
            setCurrentPage(page)
          }
        }}
      />
      <AlertMessage
        open={!!idToDelete}
        onOpenChange={(open) => {
          // Solo permitir cerrar el diálogo si no está procesando
          if (!open && !isProcessing) {
            setIdToDelete(null)
          }
        }}
        title={`Eliminar ${entityName}`}
        description={`¿Está seguro de eliminar este ${entityName.toLowerCase()}? Esta acción no se puede deshacer.`}
        confirmText={isProcessing ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  )
}
