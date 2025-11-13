'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components'
import { Card } from '@una-gc/ui/components'
import { Plus, ChevronRight, PenLine, Trash2 } from 'lucide-react'
import { useStandards, useDeleteStandard } from '../../services/standards.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { StandardForm } from '../forms/standard-form'
import { formatCodeForDisplay } from '../../utils/code-utils'
import type { Standard } from '../../types/standards.types'

interface StandardsListProps {
  criterionId: string
}

export const StandardsList = ({ criterionId }: StandardsListProps) => {
  const { data: standards, isLoading, refetch } = useStandards(
    { criterionId },
    { enabled: !!criterionId } // Solo ejecutar query si criterionId existe
  )
  const { selectedStandard, selectStandard } = useSinaesNavigation()
  const deleteStandard = useDeleteStandard()

  const [formOpen, setFormOpen] = useState(false)
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null)

  const handleEdit = (standard: Standard, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingStandard(standard)
    setFormOpen(true)
  }

  const handleDelete = async (standard: Standard, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`¿Estás seguro de eliminar el estándar "${standard.name}"?`)) {
      await deleteStandard.mutateAsync(standard.id)
    }
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingStandard(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingStandard(null)
  }

  // No cargar si no hay criterionId
  if (!criterionId) {
    return <div className="text-sm text-muted-foreground">Selecciona un criterio primero</div>
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando estándares...</div>
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Estándares</h4>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Nuevo
          </Button>
        </div>

        <div className="space-y-1">
          {standards?.data?.map((standard: Standard) => (
            <Card
              key={standard.id}
              className={`p-2 cursor-pointer transition-colors hover:bg-muted/50 ${selectedStandard?.id === standard.id ? 'bg-primary/10 border-primary' : ''
                }`}
              onClick={() => selectStandard(standard)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{formatCodeForDisplay(standard.code)}</p>
                  <p className="text-xs text-muted-foreground truncate">{standard.name}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEdit(standard, e)}
                    className="h-6 w-6 p-0"
                    title="Editar estándar"
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDelete(standard, e)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    title="Eliminar estándar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {selectedStandard?.id === standard.id && (
                    <ChevronRight className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <StandardForm
        open={formOpen}
        onClose={handleFormClose}
        standard={editingStandard}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
