'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { useStandards } from '../../../services/standards.service'
import { useSinaesNavigation } from '../../../store/sinaes-navigation.store'
import { StandardForm } from '../../forms/standard-form'
import { cn } from '@una-gc/ui/lib/utils'
import type { Standard } from '../../../types/standards.types'

export const StandardsPanel = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null)

  const {
    selectedCriterion,
    selectedStandard,
    selectStandard
  } = useSinaesNavigation()

  const { data: standards, isLoading } = useStandards({
    criterionId: selectedCriterion?.id || ''
  })

  const handleSelectStandard = (standard: Standard) => {
    if (selectedStandard?.id === standard.id) {
      // Si ya está seleccionado, lo deseleccionamos
      selectStandard(null)
    } else {
      selectStandard(standard)
    }
  }

  const handleEditStandard = (e: React.MouseEvent, standard: Standard) => {
    e.stopPropagation()
    setEditingStandard(standard)
    setShowEditModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingStandard(null)
  }

  if (!selectedCriterion) {
    return null
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">
              Estándares
              <div className="text-xs font-normal text-muted-foreground mt-0.5">
                {selectedCriterion.code}
              </div>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 h-8 px-3"
            >
              <Plus className="h-4 w-4" />
              Nuevo
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
              {standards?.data?.map((standard) => (
                <div
                  key={standard.id}
                  className={cn(
                    "p-2.5 rounded-md border cursor-pointer transition-all hover:border-primary",
                    selectedStandard?.id === standard.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectStandard(standard)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {standard.code}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditStandard(e, standard)}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <span className="sr-only">Editar</span>
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}

              {standards?.data?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm mb-2">Sin estándares</div>
                  <div className="text-xs mb-4 text-center">
                    Puedes crear estándares para organizar las evidencias, o agregar evidencias directamente al criterio.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-7 px-2 text-xs"
                  >
                    Agregar estándar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <StandardForm
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCloseCreateModal}
      />

      <StandardForm
        open={showEditModal}
        onClose={handleCloseEditModal}
        standard={editingStandard}
        onSuccess={handleCloseEditModal}
      />
    </>
  )
}