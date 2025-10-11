'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { useCriteria } from '../../../services/criteria.service'
import { useSinaesNavigation } from '../../../store/sinaes-navigation.store'
import { CriterionForm } from '../../forms/criterion-form'
import { cn } from '@una-gc/ui/lib/utils'
import type { Criterion } from '../../../types/criteria.types'

export const CriteriaPanel = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null)

  const {
    selectedComponent,
    selectedCriterion,
    selectCriterion
  } = useSinaesNavigation()

  const { data: criteria, isLoading } = useCriteria({
    componentId: selectedComponent?.id || ''
  })

  const handleSelectCriterion = (criterion: Criterion) => {
    if (selectedCriterion?.id === criterion.id) {
      // Si ya está seleccionado, lo deseleccionamos
      selectCriterion(null)
    } else {
      selectCriterion(criterion)
    }
  }

  const handleEditCriterion = (e: React.MouseEvent, criterion: Criterion) => {
    e.stopPropagation()
    setEditingCriterion(criterion)
    setShowEditModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingCriterion(null)
  }

  if (!selectedComponent) {
    return null
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">
              Criterios
              <div className="text-xs font-normal text-muted-foreground mt-0.5">
                {selectedComponent.code}
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
              {criteria?.data?.map((criterion) => (
                <div
                  key={criterion.id}
                  className={cn(
                    "p-2.5 rounded-md border cursor-pointer transition-all hover:border-primary",
                    selectedCriterion?.id === criterion.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectCriterion(criterion)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {criterion.code}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditCriterion(e, criterion)}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <span className="sr-only">Editar</span>
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}

              {criteria?.data?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-sm">No hay criterios para este componente</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    Crear primer criterio
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CriterionForm
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCloseCreateModal}
      />

      <CriterionForm
        open={showEditModal}
        onClose={handleCloseEditModal}
        criterion={editingCriterion}
        onSuccess={handleCloseEditModal}
      />
    </>
  )
}