'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SimpleProofDocumentForm } from './upload/simple-proof-document-form'
import { proofDocumentService } from '../services/integrated-proof-documents.service'
import { useSinaesNavigation } from '../store/sinaes-navigation.store'

export const UploadDocumentsTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedDimension, selectedComponent, selectedCriterion, selectedStandard, selectedQualityEvidence } = useSinaesNavigation()

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Validar que se haya seleccionado una evidencia
      if (!selectedQualityEvidence) {
        toast.error('Debe seleccionar una evidencia para asociar el documento')
        return
      }

      // Preparar datos para el servicio integrado
      const documentData = {
        name: data.name,
        evidenceId: selectedQualityEvidence.id,
        proofDocumentTypeId: data.documentTypeId,
        careerIds: data.careerIds,
        file: data.file,
        // Metadatos para estructura de carpetas
        dimensionId: selectedDimension?.id || '',
        componentId: selectedComponent?.id,
        criterionId: selectedCriterion?.id,
        standardId: selectedStandard?.id
      }

      // Crear documento con archivo en Google Drive
      await proofDocumentService.createWithFile(documentData)

      toast.success('Documento probatorio creado y subido exitosamente')
    } catch (error) {
      console.error('Error al crear el documento:', error)
      toast.error('Error al crear el documento probatorio')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full">
      <SimpleProofDocumentForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}