import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import HttpClient from '@/lib/http-client'
import type { SelectedEvidenceWithHierarchy } from '../store/document-assignment.store'

export interface UploadDocumentRequest {
  // Document data
  name: string
  description?: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  proofDocumentTypeId: string

  // Google Drive metadata
  googleDriveFileId?: string
  googleDriveFolderId?: string

  // Relations
  evidences: SelectedEvidenceWithHierarchy[]
  careerIds: string[]
}

export interface UploadDocumentResponse {
  proofDocument: {
    id: string
    code: string
    name: string
    fileUrl: string
  }
  careerRelations: {
    id: string
    careerId: string
    proofDocumentId: string
  }[]
  standardEvidenceRelations: {
    id: string
    standardId: string
    evidenceId: string
  }[]
}

class DocumentUploadService {
  async uploadDocumentWithRelations(request: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    try {
      console.log('🚀 Starting document upload with relations:', request)

      // First, create all standard-evidence relations if they don't exist
      const standardEvidencePromises = request.evidences
        .filter(evidence => evidence.standard) // Only if there's a standard
        .map(async (evidence) => {
          try {
            await HttpClient.post('/standard-evidences', {
              standardId: evidence.standard!.id,
              evidenceId: evidence.evidence.id
            })
            console.log(`✅ Standard-Evidence relation created: ${evidence.standard!.id} -> ${evidence.evidence.id}`)
          } catch (error: any) {
            // If the relation already exists, that's OK
            if (error.response?.status === 409 || error.response?.data?.message?.includes('unique')) {
              console.log(`ℹ️ Standard-Evidence relation already exists: ${evidence.standard!.id} -> ${evidence.evidence.id}`)
            } else {
              console.error(`❌ Error creating standard-evidence relation:`, error)
              throw error
            }
          }
        })

      await Promise.all(standardEvidencePromises)
      console.log('✅ All standard-evidence relations processed')

      // Create the proof document for each evidence
      const documentPromises = request.evidences.map(async (evidence) => {
        const documentData = {
          name: `${request.name} - ${evidence.evidence.name}`,
          description: request.description,
          fileUrl: request.fileUrl,
          fileName: request.fileName,
          fileType: request.fileType,
          fileSize: request.fileSize,
          evidenceId: evidence.evidence.id,
          proofDocumentTypeId: request.proofDocumentTypeId,
          googleDriveFileId: request.googleDriveFileId,
          googleDriveFolderId: request.googleDriveFolderId
        }

        console.log('📄 Creating proof document:', documentData)
        const documentResponse = await HttpClient.post('/proof-documents', documentData)
        const createdDocument = documentResponse.data

        console.log('✅ Proof document created:', createdDocument.id)

        // Create career-proof-document relations for this document
        const careerRelationPromises = request.careerIds.map(async (careerId) => {
          const relationData = {
            careerId,
            proofDocumentId: createdDocument.id
          }

          console.log('🔗 Creating career-document relation:', relationData)
          const relationResponse = await HttpClient.post('/career-proof-documents', relationData)
          console.log('✅ Career-document relation created:', relationResponse.data.id)
          return relationResponse.data
        })

        const careerRelations = await Promise.all(careerRelationPromises)

        return {
          document: createdDocument,
          careerRelations,
          evidence
        }
      })

      const results = await Promise.all(documentPromises)
      console.log('✅ All documents and relations created successfully')

      if (results.length === 0) {
        throw new Error('No documents were created')
      }

      // Prepare response
      return {
        proofDocument: results[0]!.document, // Return first document as primary
        careerRelations: results.flatMap(r => r.careerRelations),
        standardEvidenceRelations: [] // These are created above
      }

    } catch (error) {
      console.error('❌ Error in uploadDocumentWithRelations:', error)
      throw error
    }
  }
}

export const documentUploadService = new DocumentUploadService()

export const useUploadDocumentWithRelations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UploadDocumentRequest) =>
      documentUploadService.uploadDocumentWithRelations(request),

    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] })
      queryClient.invalidateQueries({ queryKey: ['career-proof-documents'] })
      queryClient.invalidateQueries({ queryKey: ['standard-evidences'] })

      toast.success('¡Documentos subidos exitosamente!', {
        description: `Se creó el documento ${data.proofDocument.code} con todas sus relaciones`
      })
    },

    onError: (error: any) => {
      console.error('Upload error:', error)
      const message = error.response?.data?.message || error.message || 'Error desconocido'
      toast.error('Error al subir documentos', {
        description: message
      })
    }
  })
}
