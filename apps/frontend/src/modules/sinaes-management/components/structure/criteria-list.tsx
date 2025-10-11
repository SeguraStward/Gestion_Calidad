'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components'
import { Card } from '@una-gc/ui/components'
import { Plus, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { useCriteria, useDeleteCriterion } from '../../services/criteria.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { CriterionForm } from '../forms/criterion-form'
import type { Criterion } from '../../types/criteria.types'

interface CriteriaListProps {
  componentId: string
}

export const CriteriaList = ({ componentId }: CriteriaListProps) => {
  const { data: criteria, isLoading, refetch } = useCriteria(
    { componentId },
    { enabled: !!componentId }
  )
  const { selectedCriterion, selectCriterion } = useSinaesNavigation()
  const deleteCriterion = useDeleteCriterion()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null)

  const handleEdit = (criterion: Criterion, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCriterion(criterion)
    setFormOpen(true)
  }

  const handleDelete = async (criterion: Criterion, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`¿Estás seguro de eliminar el criterio "${criterion.name}"?`)) {
      await deleteCriterion.mutateAsync(criterion.id)
    }
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingCriterion(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingCriterion(null)
  }

  if (!componentId) {
    return <div className="text-sm text-muted-foreground">Selecciona un componente primero</div>
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando criterios...</div>
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Criterios</h4>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Nuevo
          </Button>
        </div>

        <div className="space-y-1">
          {criteria?.data?.map((criterion: Criterion) => (
            <Card
              key={criterion.id}
              className={`p-2 cursor-pointer transition-colors hover:bg-muted/50 ${selectedCriterion?.id === criterion.id ? 'bg-primary/10 border-primary' : ''
                }`}
              onClick={() => selectCriterion(criterion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{criterion.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{criterion.name}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEdit(criterion, e)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDelete(criterion, e)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {selectedCriterion?.id === criterion.id && (
                    <ChevronRight className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <CriterionForm
        open={formOpen}
        onClose={handleFormClose}
        criterion={editingCriterion}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
