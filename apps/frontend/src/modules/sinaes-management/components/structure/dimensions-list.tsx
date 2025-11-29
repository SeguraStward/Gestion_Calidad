'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components'
import { Card } from '@una-gc/ui/components'
import { Plus, ChevronRight, PenLine, Trash2 } from 'lucide-react'
import { useDimensions, useDeleteDimension } from '../../services/dimensions.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { DimensionForm } from '../forms/dimension-form'
import { formatCodeForDisplay } from '../../utils/code-utils'
import type { Dimension } from '../../types/dimensions.types'

export const DimensionsList = () => {
  const { data: dimensions, isLoading, refetch } = useDimensions()
  const { selectedDimension, selectDimension } = useSinaesNavigation()
  const deleteDimension = useDeleteDimension()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null)

  const handleEdit = (dimension: Dimension, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingDimension(dimension)
    setFormOpen(true)
  }

  const handleDelete = async (dimension: Dimension, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`¿Estás seguro de eliminar la dimensión "${dimension.name}"?`)) {
      await deleteDimension.mutateAsync(dimension.id)
    }
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingDimension(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingDimension(null)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando dimensiones...</div>
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Dimensiones</h4>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Nueva
          </Button>
        </div>

        <div className="space-y-1">
          {dimensions?.data?.map((dimension: Dimension) => (
            <Card
              key={dimension.id}
              className={`p-2 cursor-pointer transition-colors hover:bg-muted/50 ${selectedDimension?.id === dimension.id ? 'bg-primary/10 border-primary' : ''
                }`}
              onClick={() => selectDimension(dimension)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{formatCodeForDisplay(dimension.code)}</p>
                  <p className="text-xs text-muted-foreground truncate">{dimension.name}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEdit(dimension, e)}
                    className="h-6 w-6 p-0"
                    title="Editar dimensión"
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDelete(dimension, e)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    title="Eliminar dimensión"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {selectedDimension?.id === dimension.id && (
                    <ChevronRight className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <DimensionForm
        open={formOpen}
        onClose={handleFormClose}
        dimension={editingDimension}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
