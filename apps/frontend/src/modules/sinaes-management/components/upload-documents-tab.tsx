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

interface UploadDocumentsTabProps {
  /** Evidence to pre-select on mount (deep-link from inventory "Subir aquí"). */
  prefillEvidenceId?: string
  /** Career to pre-select on mount. */
  prefillCareerId?: string
}

export const UploadDocumentsTab = ({
  prefillEvidenceId,
  prefillCareerId,
}: UploadDocumentsTabProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      if (!data.evidenceIds || data.evidenceIds.length === 0) {
        toast.error('Debe seleccionar al menos una evidencia SINAES')
        return
      }
      if (!data.careerIds || data.careerIds.length === 0) {
        toast.error('Debe seleccionar al menos una carrera')
        return
      }
      if (!Array.isArray(data.files) || data.files.length === 0) {
        toast.error('Debe seleccionar al menos un archivo')
        return
      }

      const totalEvidences: number = data.evidenceIds.length
      setUploadProgress(5)

      // Each evidence becomes its OWN proof document (with its own code and
      // upload folder). Files in `data.files` are uploaded together inside
      // each document's folder.
      const results: Array<{ code: string; careers: number }> = []
      for (let i = 0; i < totalEvidences; i++) {
        const result = await proofDocumentUploadService.uploadProofDocument({
          files: data.files,
          name: data.name,
          description: data.description,
          evidenceId: data.evidenceIds[i],
          proofDocumentTypeId: data.documentTypeId,
          careerIds: data.careerIds,
        })
        results.push({
          code: result.proofDocument.code,
          careers: result.careerRelations.length,
        })
        setUploadProgress(Math.round(((i + 1) / totalEvidences) * 100))
      }

      const firstCode = results[0]?.code ?? '?'
      if (results.length > 1) {
        toast.success(`¡${results.length} documentos creados exitosamente!`, {
          description: `${firstCode} y ${results.length - 1} más, cada uno con ${data.files.length} archivo(s) asociado(s) a ${data.careerIds.length} carrera(s)`,
          duration: 7000,
        })
      } else {
        toast.success('¡Documento subido exitosamente!', {
          description: `${firstCode} con ${data.files.length} archivo(s), asociado a ${data.careerIds.length} carrera(s)`,
          duration: 5000,
        })
      }
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
        prefillEvidenceId={prefillEvidenceId}
        prefillCareerId={prefillCareerId}
      />
    </div>
  )
}