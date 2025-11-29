'use client'

import { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateDimension, useUpdateDimension, useDimensions } from '../../services/dimensions.service'
import { useAutoNumbering } from '../../services/auto-numbering.service'
import { checkDuplicateName, showDuplicateAlert } from '../../utils/validation-utils'
import type { Dimension, CreateDimensionDto } from '../../types/dimensions.types'

interface DimensionFormProps {
  open: boolean
  onClose: () => void
  dimension?: Dimension | null
  onSuccess?: () => void
}

export const DimensionForm = ({ open, onClose, dimension, onSuccess }: DimensionFormProps) => {
  const [formData, setFormData] = useState<CreateDimensionDto>({
    name: dimension?.name || '',
    code: dimension?.code || '',
    description: dimension?.description || '',
    order: dimension?.order || 0
  })
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const createDimension = useCreateDimension()
  const updateDimension = useUpdateDimension()
  const { data: dimensions } = useDimensions() // Para validación de duplicados
  const { generateNextNumber } = useAutoNumbering()

  // Sincronizar formData cuando cambie dimension
  useEffect(() => {
    if (dimension) {
      setFormData({
        name: dimension.name || '',
        code: dimension.code || '',
        description: dimension.description || '',
        order: dimension.order || 0
      })
    } else {
      setFormData({ name: '', code: '', description: '', order: 0 })
    }
  }, [dimension, open])

  // Auto-generate code for new dimensions
  useEffect(() => {
    const generateCodeForNewDimension = async () => {
      if (!dimension && open && !formData.code) {
        setIsGeneratingCode(true)
        try {
          const result = await generateNextNumber({ entityType: 'dimension' })
          setFormData(prev => ({
            ...prev,
            code: result.code,
            order: result.order
          }))
        } catch (error) {
          console.error('Error generating dimension code:', error)
        } finally {
          setIsGeneratingCode(false)
        }
      }
    }

    generateCodeForNewDimension()
  }, [dimension, open, formData.code, generateNextNumber])

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    try {
      const result = await generateNextNumber({ entityType: 'dimension' })
      setFormData(prev => ({
        ...prev,
        code: result.code,
        order: result.order
      }))
    } catch (error) {
      console.error('Error generating dimension code:', error)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validación de duplicados
      if (checkDuplicateName(formData.name, dimensions?.data, dimension?.id)) {
        showDuplicateAlert('dimensión', formData.name)
        return
      }

      if (dimension) {
        await updateDimension.mutateAsync({ id: dimension.id, data: formData })
        toast.success('Dimensión actualizada correctamente', {
          duration: 3000,
          position: 'top-center'
        })
      } else {
        await createDimension.mutateAsync(formData)
        toast.success('Dimensión creada correctamente', {
          duration: 3000,
          position: 'top-center'
        })
      }

      onSuccess?.()
      onClose()

      // Reset form
      setFormData({ name: '', code: '', description: '', order: 0 })
    } catch (error: any) {
      console.error('Error saving dimension:', error)

      // Mostrar mensaje de error del servidor
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al guardar la dimensión'
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      })
    }
  }

  const handleClose = () => {
    setFormData({ name: '', code: '', description: '', order: 0 })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dimension ? 'Editar Dimensión' : 'Nueva Dimensión'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Se genera automáticamente"
                  className="flex-1"
                  readOnly={!dimension} // Solo editable cuando se está editando
                />
                {!dimension && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                    className="px-3"
                  >
                    {isGeneratingCode ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {!dimension && (
                <p className="text-xs text-muted-foreground">
                  El código se genera automáticamente: 1, 2, 3...
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la dimensión"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la dimensión"
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
              disabled={createDimension.isPending || updateDimension.isPending}
            >
              {createDimension.isPending || updateDimension.isPending
                ? 'Guardando...'
                : dimension ? 'Actualizar' : 'Crear'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
