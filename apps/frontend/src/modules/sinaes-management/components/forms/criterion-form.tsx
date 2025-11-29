'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateCriterion, useUpdateCriterion, useCriteria } from '../../services/criteria.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import type { Criterion, CreateCriterionDto } from '../../types/criteria.types'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'
import { checkDuplicateName, showDuplicateAlert } from '../../utils/validation-utils'

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
    hasDirectEvidences: criterion?.hasDirectEvidences || false,
    status: criterion?.status || 'ACTIVE'
  })

  const createCriterion = useCreateCriterion()
  const updateCriterion = useUpdateCriterion()
  const { generateCriterionCode, isGenerating } = useAutoNumbering()

  // Get existing criteria for validation
  const { data: criteria } = useCriteria(
    { componentId: selectedComponent?.id || '' },
    { enabled: !!selectedComponent?.id }
  )

  // Sincronizar formData cuando cambie criterion
  useEffect(() => {
    if (criterion) {
      setFormData({
        name: criterion.name || '',
        code: criterion.code || '',
        description: criterion.description || '',
        order: criterion.order || 0,
        componentId: criterion.componentId || selectedComponent?.id || '',
        hasDirectEvidences: criterion.hasDirectEvidences || false,
        status: criterion.status || 'ACTIVE'
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        componentId: selectedComponent?.id || '',
        hasDirectEvidences: false,
        status: 'ACTIVE'
      })
    }
  }, [criterion, open, selectedComponent?.id])

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

    // Validación de duplicados
    if (checkDuplicateName(formData.name, criteria?.data, criterion?.id)) {
      showDuplicateAlert('criterio', formData.name)
      return
    }

    try {
      if (criterion) {
        await updateCriterion.mutateAsync({ id: criterion.id, data: formData })
        toast.success('Criterio actualizado correctamente', {
          duration: 3000,
          position: 'top-center'
        })
      } else {
        await createCriterion.mutateAsync(formData)
        toast.success('Criterio creado correctamente', {
          duration: 3000,
          position: 'top-center'
        })
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
        hasDirectEvidences: false,
        status: 'ACTIVE'
      })
    } catch (error: any) {
      console.error('Error saving criterion:', error)

      // Mostrar mensaje de error del servidor
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al guardar el criterio'
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      })
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      order: 0,
      componentId: selectedComponent?.id || '',
      hasDirectEvidences: false,
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

            <div className="flex items-center space-x-2 border rounded-md p-3 bg-muted/50">
              <Checkbox
                id="hasDirectEvidences"
                checked={formData.hasDirectEvidences}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, hasDirectEvidences: checked === true }))
                }
              />
              <div className="flex-1">
                <Label htmlFor="hasDirectEvidences" className="cursor-pointer">
                  Evidencias directas
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Si se activa, este criterio tendrá evidencias directas en lugar de estándares
                </p>
              </div>
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
