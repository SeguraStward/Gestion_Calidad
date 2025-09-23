'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { useCreateStandard, useUpdateStandard } from '../../services/standards.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import type { Standard, CreateStandardDto } from '../../types/standards.types'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'

interface StandardFormProps {
  open: boolean
  onClose: () => void
  standard?: Standard | null
  onSuccess?: () => void
}

export const StandardForm = ({ open, onClose, standard, onSuccess }: StandardFormProps) => {
  const { selectedCriterion } = useSinaesNavigation()
  const [formData, setFormData] = useState<CreateStandardDto>({
    name: standard?.name || '',
    code: standard?.code || '',
    description: standard?.description || '',
    order: standard?.order || 0,
    criterionId: standard?.criterionId || selectedCriterion?.id || '',
    status: standard?.status || 'ACTIVE'
  })

  const createStandard = useCreateStandard()
  const updateStandard = useUpdateStandard()
  const { generateStandardCode, isGenerating } = useAutoNumbering()

  // Auto-generate code for new standards
  useEffect(() => {
    if (!standard && open && !formData.code && formData.criterionId) {
      handleGenerateCode()
    }
  }, [open, standard, formData.criterionId])

  const handleGenerateCode = async () => {
    if (!formData.criterionId) {
      alert('Debe seleccionar un criterio primero')
      return
    }

    try {
      const code = await generateStandardCode(formData.criterionId)
      setFormData(prev => ({ ...prev, code }))
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.criterionId) {
      alert('Debe seleccionar un criterio primero')
      return
    }

    try {
      if (standard) {
        await updateStandard.mutateAsync({ id: standard.id, data: formData })
      } else {
        await createStandard.mutateAsync(formData)
      }

      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        criterionId: selectedCriterion?.id || '',
        status: 'ACTIVE'
      })
    } catch (error) {
      console.error('Error saving standard:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      order: 0,
      criterionId: selectedCriterion?.id || '',
      status: 'ACTIVE'
    })
    onClose()
  }

  if (!selectedCriterion) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {standard ? 'Editar Estándar' : 'Nuevo Estándar'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Criterio: {selectedCriterion.name}
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
                  disabled={isGenerating || !formData.criterionId}
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
                placeholder="ej. 1.1.1.1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del estándar"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del estándar"
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
              disabled={createStandard.isPending || updateStandard.isPending}
            >
              {createStandard.isPending || updateStandard.isPending
                ? 'Guardando...'
                : standard ? 'Actualizar' : 'Crear'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
