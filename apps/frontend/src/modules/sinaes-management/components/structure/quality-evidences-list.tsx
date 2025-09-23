'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components'
import { Card } from '@una-gc/ui/components'
import { Plus, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { useQualityEvidences, useDeleteQualityEvidence } from '../../services/quality-evidences.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { QualityEvidenceForm } from '../forms/quality-evidence-form'
import type { QualityEvidence } from '../../types/quality-evidences.types'

export const QualityEvidencesList = () => {
  const { data: evidences, isLoading, refetch } = useQualityEvidences()
  const { selectedQualityEvidence, selectQualityEvidence } = useSinaesNavigation()
  const deleteEvidence = useDeleteQualityEvidence()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEvidence, setEditingEvidence] = useState<QualityEvidence | null>(null)

  const handleEdit = (evidence: QualityEvidence, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEvidence(evidence)
    setFormOpen(true)
  }

  const handleDelete = async (evidence: QualityEvidence, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`¿Estás seguro de eliminar la evidencia "${evidence.name}"?`)) {
      await deleteEvidence.mutateAsync(evidence.id)
    }
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingEvidence(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingEvidence(null)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando evidencias...</div>
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Evidencias</h4>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Nueva
          </Button>
        </div>

        <div className="space-y-1">
          {evidences?.data?.map((evidence: QualityEvidence) => (
            <Card
              key={evidence.id}
              className={`p-2 cursor-pointer transition-colors hover:bg-muted/50 ${selectedQualityEvidence?.id === evidence.id ? 'bg-primary/10 border-primary' : ''
                }`}
              onClick={() => selectQualityEvidence(evidence)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{evidence.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{evidence.name}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEdit(evidence, e)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDelete(evidence, e)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {selectedQualityEvidence?.id === evidence.id && (
                    <ChevronRight className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <QualityEvidenceForm
        open={formOpen}
        onClose={handleFormClose}
        evidence={editingEvidence}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
