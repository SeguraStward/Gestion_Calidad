'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SimpleProofDocumentForm } from './upload/simple-proof-document-form'
import { proofDocumentService } from '../services/integrated-proof-documents.service'
import { useGoogleDriveUpload } from '../hooks/use-google-drive-upload'

export const UploadDocumentsTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { uploadToGoogleDrive, isUploading, uploadProgress } = useGoogleDriveUpload()

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Validar que se hayan seleccionado evidencias
      if (!data.evidenceIds || data.evidenceIds.length === 0) {
        toast.error('Debe seleccionar al menos una evidencia SINAES')
        return
      }

      // Validar que haya al menos una carrera seleccionada
      if (!data.careerIds || data.careerIds.length === 0) {
        toast.error('Debe seleccionar al menos una carrera')
        return
      }

      // Obtener información de la primera evidencia seleccionada
      // (Usamos la primera evidencia para la estructura de carpetas en Google Drive)
      const firstEvidenceId = data.evidenceIds[0]
      const evidenceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quality-evidences/${firstEvidenceId}`, {
        credentials: 'include'
      })

      if (!evidenceResponse.ok) {
        throw new Error('No se pudo obtener la información de la evidencia')
      }

      const evidenceData = await evidenceResponse.json()
      const evidence = evidenceData.data

      // La evidencia debe tener relaciones con standard, criterion, component, dimension
      if (!evidence.standard?.criterion?.component?.dimension) {
        throw new Error('La evidencia no tiene la jerarquía completa')
      }

      const standard = evidence.standard
      const criterion = standard.criterion
      const component = criterion.component
      const dimension = component.dimension

      // Obtener información de la primera carrera seleccionada
      const firstCareerId = data.careerIds[0]
      const careerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/careers/${firstCareerId}`, {
        credentials: 'include'
      })

      if (!careerResponse.ok) {
        throw new Error('No se pudo obtener la información de la carrera')
      }

      const careerData = await careerResponse.json()
      const career = careerData.data

      // Usar el hook para subir a Google Drive con progreso
      const uploadResult = await uploadToGoogleDrive({
        file: data.file,
        folderStructure: {
          dimensionCode: dimension.code,
          dimensionName: dimension.name,
          componentCode: component.code,
          componentName: component.name,
          criterionCode: criterion.code,
          criterionName: criterion.name,
          standardCode: standard.code,
          standardName: standard.name,
          evidenceCode: evidence.code,
          evidenceName: evidence.name,
          careerCode: career.code,
          careerName: career.name
        }
      })

      if (!uploadResult) {
        throw new Error('No se pudo subir el archivo a Google Drive')
      }

      // Crear registros en BD para cada evidencia seleccionada
      // (El documento probatorio puede estar asociado a múltiples evidencias)
      for (const evidenceId of data.evidenceIds) {
        await proofDocumentService.create({
          name: data.name,
          description: data.description,
          evidenceId: evidenceId,
          proofDocumentTypeId: data.documentTypeId,
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileType: data.file.type,
          fileSize: data.file.size,
          googleDriveFileId: uploadResult.fileId,
          googleDriveFolderId: uploadResult.folderId
        } as any)
      }

      // Asociar con carreras
      // TODO: Implementar asociación con múltiples carreras si es necesario

      toast.success('Documento probatorio creado y subido exitosamente', {
        description: `Archivo "${uploadResult.fileName}" guardado en Google Drive`
      })
    } catch (error: any) {
      console.error('Error al crear el documento:', error)

      // El hook ya muestra el error específico de Google Drive
      if (!error.message?.includes('Google')) {
        toast.error('Error al crear el documento probatorio', {
          description: error.message
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full">
      <SimpleProofDocumentForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}