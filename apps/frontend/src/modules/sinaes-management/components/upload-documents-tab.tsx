'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SimpleProofDocumentForm } from './upload/simple-proof-document-form'
import { proofDocumentUploadService } from '../services/proof-document-upload.service'

/**
 * Component for uploading proof documents with Google Drive integration
 * Uses the integrated backend endpoint /proof-documents/upload that handles:
 * - Google Drive folder creation
 * - File upload with document code prefix
 * - _carreras.txt file creation
 * - Database record creation
 * - Career-proof-document relations
 */

export const UploadDocumentsTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setUploadProgress(0)

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

      console.log('📤 [UploadDocumentsTab] Starting upload process for', data.evidenceIds.length, 'evidence(s)')
      setUploadProgress(10)

      // Subir documento para la primera evidencia usando endpoint integrado
      // Este endpoint hace TODO: Drive upload, DB creation, relations, code generation
      console.log('� [UploadDocumentsTab] Uploading for first evidence:', data.evidenceIds[0])

      const result = await proofDocumentUploadService.uploadProofDocument({
        file: data.file,
        name: data.name,
        description: data.description,
        evidenceId: data.evidenceIds[0], // Primera evidencia
        proofDocumentTypeId: data.documentTypeId,
        careerIds: data.careerIds
      })

      console.log('✅ [UploadDocumentsTab] First document uploaded:', result.proofDocument.code)
      setUploadProgress(50)

      // Si hay múltiples evidencias, crear documentos adicionales
      if (data.evidenceIds.length > 1) {
        console.log('📚 [UploadDocumentsTab] Creating documents for', data.evidenceIds.length - 1, 'additional evidence(s)')

        const progressStep = 50 / (data.evidenceIds.length - 1)

        for (let i = 1; i < data.evidenceIds.length; i++) {
          console.log(`� [UploadDocumentsTab] Uploading for evidence ${i + 1}/${data.evidenceIds.length}:`, data.evidenceIds[i])

          await proofDocumentUploadService.uploadProofDocument({
            file: data.file,
            name: data.name,
            description: data.description,
            evidenceId: data.evidenceIds[i],
            proofDocumentTypeId: data.documentTypeId,
            careerIds: data.careerIds
          })

          setUploadProgress(50 + (progressStep * i))
        }

        setUploadProgress(100)

        toast.success(`¡${data.evidenceIds.length} documentos creados exitosamente!`, {
          description: `Documento ${result.proofDocument.code} y ${data.evidenceIds.length - 1} más asociados a ${result.careerRelations.length} carrera(s)`,
          duration: 7000
        })
      } else {
        setUploadProgress(100)

        toast.success('¡Documento subido exitosamente!', {
          description: `Documento ${result.proofDocument.code} creado y asociado a ${result.careerRelations.length} carrera(s)`,
          duration: 5000
        })
      }

      console.log('🎉 [UploadDocumentsTab] Upload process completed successfully')

    } catch (error: any) {
      console.error('❌ [UploadDocumentsTab] Upload failed:', error)

      const message = error.response?.data?.message || error.message || 'Error desconocido'

      // Manejo específico de errores de autenticación de Google
      if (message.includes('authenticated with Google') || message.includes('log in with Google')) {
        toast.error('Debes volver a iniciar sesión con Google', {
          description: 'Cierra sesión y vuelve a iniciar sesión con tu cuenta de Google para habilitar las funciones de Drive.',
          duration: 10000
        })
      } else if (message.includes('Google Drive authentication expired')) {
        toast.error('Tu sesión de Google Drive expiró', {
          description: 'Por favor, cierra sesión y vuelve a iniciar sesión.',
          duration: 7000
        })
      } else {
        toast.error('Error al subir el documento', {
          description: message,
          duration: 5000
        })
      }
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="h-full">
      <SimpleProofDocumentForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}