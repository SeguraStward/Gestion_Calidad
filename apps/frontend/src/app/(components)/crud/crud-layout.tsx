'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@una-gc/ui/components/input'
import { AlertMessage } from '@/app/(components)/ui/alert-message'
import { Card, CardContent } from '@una-gc/ui/components/card'

interface FilterBarProps {
  value: string
  onChange: (value: string) => void
}

export const FilterBar = ({ value, onChange }: FilterBarProps) => (
  <div className="mb-4">
    <Input type="text" placeholder="Buscar por..." value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
)

interface CrudLayoutProps<T> {
  nombreEntidad: string
  items: T[]
  editandoId: string | null
  idAEliminar: string | null
  setEditandoId: (id: string | null) => void
  setIdAEliminar: (id: string | null) => void
  onDelete: (id: string) => void
  renderForm: () => React.ReactNode
  renderItem: (item: T, isEditing: boolean, onEdit: () => void, onDelete: () => void) => React.ReactNode
  getItemName?: (item: T) => string
  onEditandoIdChange?: (editandoId: string | null) => void // pa limpiar el form
}

export function CrudLayout<T>({
  nombreEntidad,
  items,
  editandoId,
  idAEliminar,
  setEditandoId,
  setIdAEliminar,
  onDelete,
  renderForm,
  renderItem,
  getItemName,
  onEditandoIdChange
}: CrudLayoutProps<T>) {
  const [filter, setFilter] = useState('')

  // Filtrar items según búsqueda
  const itemsFiltrados = filter
    ? items.filter((item) => (getItemName ? getItemName(item) : '').toLowerCase().includes(filter.toLowerCase()))
    : items

  // Cuando editandoId cambia, avisar para resetear formulario en componente padre
  useEffect(() => {
    if (onEditandoIdChange) onEditandoIdChange(editandoId)
  }, [editandoId, onEditandoIdChange])

  // Si borrás un item que estás editando, el editandoId debería limpiarse
  useEffect(() => {
    if (editandoId && !items.find((i) => (i as any).id === editandoId)) {
      setEditandoId(null)
    }
  }, [editandoId, items, setEditandoId])

  const itemAEliminar = items.find((i) => (i as any).id === idAEliminar)

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>{renderForm()}</Card>

        {/* Listado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{nombreEntidad} Registrados</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length}</span>
          </div>

          <FilterBar value={filter} onChange={setFilter} />

          {itemsFiltrados.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-medium mb-2">No hay {nombreEntidad.toLowerCase()}</h3>
                <p className="text-sm text-gray-500">Agrega usando el formulario</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {itemsFiltrados.map((item) => {
                const id = (item as any).id
                const isEditing = editandoId === id

                return (
                  <div key={id} className={`transition-all ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
                    {renderItem(
                      item,
                      isEditing,
                      () => setEditandoId(id),
                      () => setIdAEliminar(id)
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {idAEliminar && itemAEliminar && (
        <AlertMessage
          open
          variant="danger"
          title={`¿Eliminar ${nombreEntidad.toLowerCase()}?`}
          description={`Se eliminará "${getItemName ? getItemName(itemAEliminar) : nombreEntidad}" permanentemente.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => {
            onDelete(idAEliminar)
            setIdAEliminar(null)
          }}
          onOpenChange={(open) => !open && setIdAEliminar(null)}
        />
      )}
    </div>
  )
}
