'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateComponent, useUpdateComponent, useComponents } from '../../services/components.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import type { Component, CreateComponentDto } from '../../types/components.types'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'
import { checkDuplicateName, showDuplicateAlert } from '../../utils/validation-utils'

interface ComponentFormProps {
  open: boolean
  onClose: () => void
  component?: Component | null
  onSuccess?: () => void
}

export const ComponentForm = ({ open, onClose, component, onSuccess }: ComponentFormProps) => {
  const { selectedDimension } = useSinaesNavigation()
  const [formData, setFormData] = useState<CreateComponentDto>({
    name: component?.name || '',
    code: component?.code || '',
    description: component?.description || '',
    order: component?.order || 0,
    dimensionId: component?.dimensionId || selectedDimension?.id || '',
    status: component?.status || 'ACTIVE'
  })

  const createComponent = useCreateComponent()
  const updateComponent = useUpdateComponent()
  const { generateComponentCode, isGenerating } = useAutoNumbering()

  // Get existing components for validation
  const { data: components } = useComponents(
    { dimensionId: selectedDimension?.id || '' },
    { enabled: !!selectedDimension?.id }
  )

  // Sincronizar formData cuando cambie component
  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name || '',
        code: component.code || '',
        description: component.description || '',
        order: component.order || 0,
        dimensionId: component.dimensionId || selectedDimension?.id || '',
        status: component.status || 'ACTIVE'
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 0,
        dimensionId: selectedDimension?.id || '',
        status: 'ACTIVE'
      })
    }
  }, [component, open, selectedDimension?.id])

  // Auto-generate code for new components
  useEffect(() => {
    if (!component && open && !formData.code && formData.dimensionId) {
      handleGenerateCode()
    }
  }, [open, component, formData.dimensionId])

  const handleGenerateCode = async () => {
    if (!formData.dimensionId) {
      alert('Debe seleccionar una dimensión primero')
      return
    }

    try {
      const code = await generateComponentCode(formData.dimensionId)
      setFormData(prev => ({ ...prev, code }))
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dimensionId) {
      alert('Debe seleccionar una dimensión primero')
      return
    }

    // Validación de duplicados
    if (checkDuplicateName(formData.name, components?.data, component?.id)) {
      showDuplicateAlert('componente', formData.name)
      return
    }

    try {
      if (component) {
        await updateComponent.mutateAsync({ id: component.id, data: formData })
        toast.success('Componente actualizado correctamente', {
          duration: 3000,
          position: 'top-center'
        })
      } else {
        await createComponent.mutateAsync(formData)
        toast.success('Componente creado correctamente', {
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
        dimensionId: selectedDimension?.id || '',
        status: 'ACTIVE'
      })
    } catch (error: any) {
      console.error('Error saving component:', error)

      // Mostrar mensaje de error del servidor
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al guardar el componente'
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
      dimensionId: selectedDimension?.id || '',
      status: 'ACTIVE'
    })
    onClose()
  }

  if (!selectedDimension) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {component ? 'Editar Componente' : 'Nuevo Componente'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Dimensión: {selectedDimension.name}
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
                  disabled={isGenerating || !formData.dimensionId}
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
                placeholder="ej. 1.1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del componente"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del componente"
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
              disabled={createComponent.isPending || updateComponent.isPending}
            >
              {createComponent.isPending || updateComponent.isPending
                ? 'Guardando...'
                : component ? 'Actualizar' : 'Crear'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
