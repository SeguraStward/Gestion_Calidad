import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import HttpClient from '@/lib/http-client'

/**
 * Request DTO for uploading proof document with Google Drive integration
 * This uses the integrated backend endpoint that handles everything:
 * - Creates folder structure in Google Drive
 * - Uploads file with document code prefix
 * - Creates _carreras.txt file
 * - Saves proof document in database
 * - Creates career-proof-document relations
 */
export interface UploadProofDocumentRequest {
  /** One or more files to upload as part of the same "upload batch". */
  files: File[]
  name: string
  description?: string
  evidenceId: string
  proofDocumentTypeId: string
  careerIds: string[]
}

/**
 * Response from the integrated upload endpoint
 */
export interface UploadProofDocumentResponse {
  proofDocument: {
    id: string
    code: string // Auto-generated: CONV-001, ACT-002, etc.
    name: string
    description?: string
    fileUrl: string // Google Drive URL (primary file)
    fileName: string // CONV-001_original-name.pdf
    fileType: string
    fileSize: number
    evidenceId: string
    proofDocumentTypeId: string
    googleDriveFileId: string
    googleDriveFolderId: string
    googleDriveTypeFolderId?: string
    googleDriveUploadFolderId?: string
    status: string
    createdAt: string
  }
  careerRelations: Array<{
    id: string
    careerId: string
    proofDocumentId: string
    createdAt: string
  }>
  /** Drive path of the per-upload folder (e.g. ".../Convenio/CONV-001"). */
  folderPath: string
  /** All files uploaded as part of this batch. */
  uploadedFiles: Array<{ id: string; name: string; url: string; size: number }>
}

class ProofDocumentUploadService {
  private readonly basePath = '/proof-documents'

  /**
   * Upload proof document using the integrated backend endpoint
   * This endpoint handles everything in one request:
   * 1. Validates evidence and gets SINAES hierarchy
   * 2. Gets career names
   * 3. Generates document code (CONV-001, etc.)
   * 4. Creates folder structure in Google Drive
   * 5. Uploads file with code prefix
   * 6. Creates _carreras.txt file
   * 7. Saves document in database
   * 8. Creates career-proof-document relations
   */
  async uploadProofDocument(
    request: UploadProofDocumentRequest
  ): Promise<UploadProofDocumentResponse> {
    try {
      console.log('🚀 [ProofDocumentUploadService] Starting upload:', request.name)

      // Build FormData for multipart/form-data request. The backend accepts
      // multiple files under the `files` field (FilesInterceptor); a single
      // `file` field is kept for legacy callers but new code should use the
      // multi-file path.
      const formData = new FormData()
      for (const f of request.files) {
        formData.append('files', f)
      }
      formData.append('name', request.name)

      if (request.description) {
        formData.append('description', request.description)
      }

      formData.append('evidenceId', request.evidenceId)
      formData.append('proofDocumentTypeId', request.proofDocumentTypeId)

      // Backend expects JSON string for array
      formData.append('careerIds', JSON.stringify(request.careerIds))

      console.log('📤 [ProofDocumentUploadService] Sending request to /proof-documents/upload')

      const response = await HttpClient.post(`${this.basePath}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // El backend envuelve la respuesta en { data: { proofDocument, careerRelations, ... } }
      const actualData = response.data?.data ?? response.data

      if (!actualData?.proofDocument?.id || !Array.isArray(actualData?.careerRelations)) {
        throw new Error(
          'Respuesta inválida del servidor: falta proofDocument o careerRelations en el payload de upload'
        )
      }

      return actualData as UploadProofDocumentResponse
    } catch (error: any) {
      console.error('❌ [ProofDocumentUploadService] Upload failed:', error)
      console.error('❌ Error response:', error.response?.data)
      throw error
    }
  }
}

export const proofDocumentUploadService = new ProofDocumentUploadService()

/**
 * React Query hook for uploading proof documents
 * Handles mutation, cache invalidation, and toast notifications
 */
export const useUploadProofDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UploadProofDocumentRequest) =>
      proofDocumentUploadService.uploadProofDocument(request),

    onSuccess: (data) => {
      console.log('✅ Upload mutation successful:', data.proofDocument.code)

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] })
      queryClient.invalidateQueries({ queryKey: ['career-proof-documents'] })
      queryClient.invalidateQueries({ queryKey: ['quality-evidences'] })

      toast.success('¡Documento subido exitosamente!', {
        description: `Documento ${data.proofDocument.code} creado y asociado a ${data.careerRelations.length} carrera(s)`,
        duration: 5000
      })
    },

    onError: (error: any) => {
      console.error('❌ Upload mutation error:', error)

      const message = error.response?.data?.message || error.message || 'Error desconocido'

      // Handle specific error cases
      if (message.includes('authenticated with Google') || message.includes('log in with Google')) {
        toast.error('Debes volver a iniciar sesión con Google', {
          description: 'Cierra sesión y vuelve a entrar con tu cuenta de Google para habilitar las funciones de Drive.',
          duration: 7000
        })
      } else if (message.includes('Evidence not found')) {
        toast.error('Evidencia no encontrada', {
          description: 'La evidencia seleccionada no existe o fue eliminada.',
          duration: 5000
        })
      } else if (message.includes('Only administrators')) {
        toast.error('Solo administradores pueden subir archivos', {
          description: 'Necesitas permisos de administrador para gestionar documentos de SINAES.',
          duration: 5000
        })
      } else {
        toast.error('Error al subir el documento', {
          description: message,
          duration: 5000
        })
      }
    }
  })
}
