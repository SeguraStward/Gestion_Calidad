'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { useCreateCriterion, useUpdateCriterion } from '../../services/criteria.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import type { Criterion, CreateCriterionDto } from '../../types/criteria.types'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'

interface CriterionFormProps {
  open: boolean
  onClose: () => void
  criterion?: Criterion | null
  onSuccess?: () => void
}

export const CriterionForm = ({ open, onClose, criterion, onSuccess }: CriterionFormProps) => {
  const { selectedComponent } = useSinaesNavigation()
  const [formData, setFormData] = useState<CreateCriterionDto>({
    name: criterion?.name || '',
    code: criterion?.code || '',
    description: criterion?.description || '',
    order: criterion?.order || 0,
    componentId: criterion?.componentId || selectedComponent?.id || '',
    status: criterion?.status || 'ACTIVE'
  })

  const createCriterion = useCreateCriterion()
  const updateCriterion = useUpdateCriterion()
  const { generateCriterionCode, isGenerating } = useAutoNumbering()

  // Auto-generate code for new criteria
  useEffect(() => {
    if (!criterion && open && !formData.code && formData.componentId) {
      handleGenerateCode()
    }
  }, [open, criterion, formData.componentId])

  const handleGenerateCode = async () => {
    if (!formData.componentId) {
      alert('Debe seleccionar un componente primero')
      return
    }

    try {
      const code = await generateCriterionCode(formData.componentId)
      setFormData(prev => ({ ...prev, code }))
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.componentId) {
      alert('Debe seleccionar un componente primero')
      return
    }

    try {
      if (criterion) {
        await updateCriterion.mutateAsync({ id: criterion.id, data: formData })
      } else {
        await createCriterion.mutateAsync(formData)
      }

      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        componentId: selectedComponent?.id || '',
        status: 'ACTIVE'
      })
    } catch (error) {
      console.error('Error saving criterion:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      order: 0,
      componentId: selectedComponent?.id || '',
      status: 'ACTIVE'
    })
    onClose()
  }

  if (!selectedComponent) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {criterion ? 'Editar Criterio' : 'Nuevo Criterio'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Componente: {selectedComponent.name}
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
                  disabled={isGenerating || !formData.componentId}
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
                placeholder="ej. 1.1.1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del criterio"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del criterio"
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
              disabled={createCriterion.isPending || updateCriterion.isPending}
            >
              {createCriterion.isPending || updateCriterion.isPending
                ? 'Guardando...'
                : criterion ? 'Actualizar' : 'Crear'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
