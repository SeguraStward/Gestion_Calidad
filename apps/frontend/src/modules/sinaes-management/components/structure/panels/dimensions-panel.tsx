'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { useDimensions } from '../../../services/dimensions.service'
import { useSinaesNavigation } from '../../../store/sinaes-navigation.store'
import { DimensionForm } from '../../forms/dimension-form'
import { cn } from '@una-gc/ui/lib/utils'
import type { Dimension } from '../../../types/dimensions.types'

export const DimensionsPanel = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null)

  const { data: dimensions, isLoading } = useDimensions()
  const {
    selectedDimension,
    selectDimension,
    reset
  } = useSinaesNavigation()

  const handleSelectDimension = (dimension: Dimension) => {
    if (selectedDimension?.id === dimension.id) {
      // Si ya está seleccionada, la deseleccionamos
      reset()
    } else {
      selectDimension(dimension)
    }
  }

  const handleEditDimension = (e: React.MouseEvent, dimension: Dimension) => {
    e.stopPropagation()
    setEditingDimension(dimension)
    setShowEditModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingDimension(null)
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Dimensiones</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 h-8 px-3"
            >
              <Plus className="h-4 w-4" />
              Nueva
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {dimensions?.data?.map((dimension) => (
                <div
                  key={dimension.id}
                  className={cn(
                    "p-2.5 rounded-md border cursor-pointer transition-all hover:border-primary",
                    selectedDimension?.id === dimension.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectDimension(dimension)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {dimension.code}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditDimension(e, dimension)}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <span className="sr-only">Editar</span>
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}

              {dimensions?.data?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-sm">No hay dimensiones creadas</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    Crear primera dimensión
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DimensionForm
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCloseCreateModal}
      />

      <DimensionForm
        open={showEditModal}
        onClose={handleCloseEditModal}
        dimension={editingDimension}
        onSuccess={handleCloseEditModal}
      />
    </>
  )
}