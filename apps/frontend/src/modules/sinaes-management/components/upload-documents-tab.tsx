'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SinaesEvidenceForm } from './upload/sinaes-evidence-form'
import type { EvidenceFormData } from '../../evidence-management/types/evidence.types'

export const UploadDocumentsTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: EvidenceFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implementar la lógica real de guardado
      console.log('Datos del formulario:', data)

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Evidencia guardada exitosamente')

      // Aquí podrías redirigir o resetear el formulario
    } catch (error) {
      console.error('Error al guardar la evidencia:', error)
      toast.error('Error al guardar la evidencia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Lógica para cancelar o limpiar el formulario
    toast.info('Formulario cancelado')
  }

  return (
    <SinaesEvidenceForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={handleCancel}
    />
  )
}