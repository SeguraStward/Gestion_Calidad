'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { useQualityEvidences } from '../../../services/quality-evidences.service'
import { useSinaesNavigation } from '../../../store/sinaes-navigation.store'
import { QualityEvidenceForm } from '../../forms/quality-evidence-form'
import { cn } from '@una-gc/ui/lib/utils'
import type { QualityEvidence } from '../../../types/quality-evidences.types'

export const QualityEvidencesPanel = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvidence, setEditingEvidence] = useState<QualityEvidence | null>(null)

  const {
    selectedCriterion,
    selectedStandard,
    selectedQualityEvidence,
    selectQualityEvidence
  } = useSinaesNavigation()

  // Las evidencias pueden estar relacionadas con un criterio o un estándar
  const parentId = selectedStandard?.id || selectedCriterion?.id || ''
  const parentType = selectedStandard ? 'standard' : 'criterion'

  const { data: evidences, isLoading } = useQualityEvidences({
    [parentType === 'standard' ? 'standardId' : 'criterionId']: parentId
  })

  const handleSelectEvidence = (evidence: QualityEvidence) => {
    if (selectedQualityEvidence?.id === evidence.id) {
      // Si ya está seleccionada, la deseleccionamos
      selectQualityEvidence(null)
    } else {
      selectQualityEvidence(evidence)
    }
  }

  const handleEditEvidence = (e: React.MouseEvent, evidence: QualityEvidence) => {
    e.stopPropagation()
    setEditingEvidence(evidence)
    setShowEditModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingEvidence(null)
  }

  if (!selectedCriterion) {
    return null
  }

  const parentName = selectedStandard?.name || selectedCriterion?.name

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">
              {selectedStandard ? 'Evidencias del Estándar' : 'Evidencias Directas'}
              <div className="text-xs font-normal text-muted-foreground mt-1">
                {parentName}
              </div>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 h-7 px-2 text-xs flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
              Nueva
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-xs text-muted-foreground">Cargando...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {evidences?.data?.map((evidence) => (
                <div
                  key={evidence.id}
                  className={cn(
                    "p-2 rounded-md border cursor-pointer transition-all hover:border-primary",
                    selectedQualityEvidence?.id === evidence.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectEvidence(evidence)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">
                        {evidence.code} - {evidence.name}
                      </div>
                      {evidence.description && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {evidence.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditEvidence(e, evidence)}
                      className="h-5 w-5 p-0 text-xs flex-shrink-0"
                    >
                      <span className="sr-only">Editar</span>
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}

              {evidences?.data?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-xs">
                    No hay evidencias para este {parentType === 'standard' ? 'estándar' : 'criterio'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    Crear primera evidencia
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <QualityEvidenceForm
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCloseCreateModal}
      />

      <QualityEvidenceForm
        open={showEditModal}
        onClose={handleCloseEditModal}
        evidence={editingEvidence}
        onSuccess={handleCloseEditModal}
      />
    </>
  )
}