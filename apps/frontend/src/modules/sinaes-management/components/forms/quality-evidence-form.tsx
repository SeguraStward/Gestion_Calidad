'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { useCreateQualityEvidence, useUpdateQualityEvidence } from '../../services/quality-evidences.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import type { QualityEvidence, CreateQualityEvidenceDto } from '../../types/quality-evidences.types'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'

interface QualityEvidenceFormProps {
  open: boolean
  onClose: () => void
  evidence?: QualityEvidence | null
  onSuccess?: () => void
}

export const QualityEvidenceForm = ({ open, onClose, evidence, onSuccess }: QualityEvidenceFormProps) => {
  const { selectedStandard, selectedCriterion } = useSinaesNavigation()

  const [formData, setFormData] = useState<CreateQualityEvidenceDto>({
    name: evidence?.name || '',
    code: evidence?.code || '',
    description: evidence?.description || '',
    order: evidence?.order || 0,
    standardId: evidence?.standardId || selectedStandard?.id || undefined,
    criterionId: evidence?.criterionId || (selectedStandard ? undefined : selectedCriterion?.id) || undefined,
    status: evidence?.status || 'ACTIVE'
  })

  const createEvidence = useCreateQualityEvidence()
  const updateEvidence = useUpdateQualityEvidence()
  const { generateEvidenceCode, isGenerating } = useAutoNumbering()

  // Sincronizar formData cuando cambie evidence
  useEffect(() => {
    if (evidence) {
      setFormData({
        name: evidence.name || '',
        code: evidence.code || '',
        description: evidence.description || '',
        order: evidence.order || 0,
        standardId: evidence.standardId || selectedStandard?.id || undefined,
        criterionId: evidence.criterionId || (selectedStandard ? undefined : selectedCriterion?.id) || undefined,
        status: evidence.status || 'ACTIVE'
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        standardId: selectedStandard?.id || undefined,
        criterionId: selectedStandard ? undefined : selectedCriterion?.id || undefined,
        status: 'ACTIVE'
      })
    }
  }, [evidence, open, selectedStandard?.id, selectedCriterion?.id])

  // Auto-generate code for new evidences
  useEffect(() => {
    if (!evidence && open && !formData.code) {
      handleGenerateCode()
    }
  }, [open, evidence])

  // Update relation IDs when context changes (solo para nuevas evidencias)
  useEffect(() => {
    if (open && !evidence) {
      setFormData(prev => ({
        ...prev,
        standardId: selectedStandard?.id || undefined,
        criterionId: selectedStandard ? undefined : selectedCriterion?.id || undefined,
      }))
    }
  }, [open, selectedStandard, selectedCriterion, evidence])

  const handleGenerateCode = async () => {
    try {
      const code = await generateEvidenceCode()
      setFormData(prev => ({ ...prev, code }))
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔍 Enviando evidencia con datos:', {
      ...formData,
      selectedStandard: selectedStandard?.id,
      selectedCriterion: selectedCriterion?.id,
      context: selectedStandard ? 'ESTÁNDAR' : 'CRITERIO'
    })

    try {
      if (evidence) {
        await updateEvidence.mutateAsync({ id: evidence.id, data: formData })
      } else {
        await createEvidence.mutateAsync(formData)
      }

      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        standardId: selectedStandard?.id || undefined,
        criterionId: selectedStandard ? undefined : selectedCriterion?.id || undefined,
        status: 'ACTIVE'
      })
    } catch (error) {
      console.error('Error saving evidence:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      order: 0,
      standardId: selectedStandard?.id || undefined,
      criterionId: selectedStandard ? undefined : selectedCriterion?.id || undefined,
      status: 'ACTIVE'
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {evidence ? 'Editar Evidencia de Calidad' : 'Nueva Evidencia de Calidad'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {selectedStandard
              ? `Para el estándar: ${selectedStandard.code} - ${selectedStandard.name}`
              : `Para el criterio: ${selectedCriterion?.code} - ${selectedCriterion?.name}`
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Código</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="ml-1 text-xs">Regenerar</span>
                </Button>
              </div>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="ej. EVD001"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la evidencia"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la evidencia"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEvidence.isPending || updateEvidence.isPending}
            >
              {createEvidence.isPending || updateEvidence.isPending
                ? 'Guardando...'
                : evidence ? 'Actualizar' : 'Crear'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
