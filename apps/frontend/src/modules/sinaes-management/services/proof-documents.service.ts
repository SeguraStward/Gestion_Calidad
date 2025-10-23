import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import { HttpClient } from '@/lib/http-client'
import { useQuery } from '@tanstack/react-query'
import type { QualityEvidence } from '../types/quality-evidences.types'
import type { ProofDocumentType } from '../types/proof-document-types.types'
import type { ProofDocumentsResponse } from '../types/proof-documents.types'

export interface ProofDocument {
  id: string
  code: string
  name: string
  description?: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  evidenceId: string
  proofDocumentTypeId: string
  googleDriveFileId?: string
  googleDriveFolderId?: string
  googleDriveVersion?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string

  // Relations (populated cuando se incluyen en la query)
  evidence?: QualityEvidence
  proofDocumentType?: ProofDocumentType
  careerProofDocuments?: Array<{
    id: string
    careerId: string
    career?: {
      id: string
      name: string
      code: string
    }
  }>
}

export interface CreateProofDocumentDto {
  name: string
  description?: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  evidenceId: string
  proofDocumentTypeId: string
  googleDriveFileId?: string
  googleDriveFolderId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface ProofDocumentFilters {
  search?: string
  dimensionId?: string
  componentId?: string
  criterionId?: string
  standardId?: string
  evidenceId?: string
  proofDocumentTypeId?: string
  careerIds?: string[]
  dateFrom?: string
  dateTo?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface UpdateProofDocumentDto {
  name?: string
  description?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  evidenceId?: string
  proofDocumentTypeId?: string
  googleDriveFileId?: string
  googleDriveFolderId?: string
  googleDriveVersion?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export const proofDocumentService = new GenericService<
  ProofDocument,
  CreateProofDocumentDto,
  UpdateProofDocumentDto,
  ProofDocumentFilters
>('proof-documents')

export const {
  useList: useProofDocumentsList,
  useOne: useProofDocument,
  useCreate: useCreateProofDocument,
  useUpdate: useUpdateProofDocument,
  useRemove: useDeleteProofDocument
} = createGenericHooks('proof-documents', proofDocumentService, {
  messages: {
    created: () => 'Documento probatorio creado con éxito',
    updated: () => 'Documento probatorio actualizado con éxito',
    deleted: () => 'Documento probatorio eliminado con éxito'
  }
})

/**
 * Custom hook for searching proof documents using the /search endpoint
 */
export const useProofDocuments = (filters?: ProofDocumentFilters) => {
  return useQuery<ProofDocumentsResponse>({
    queryKey: ['proof-documents', 'search', filters],
    queryFn: async () => {
      const response = await HttpClient.get<ProofDocumentsResponse>('/proof-documents/search', {
        params: filters
      })
      return response.data
    },
    enabled: true,
    staleTime: 30000
  })
}

/**
 * Download a proof document (opens Google Drive URL)
 */
export const downloadProofDocument = (document: { fileUrl: string }) => {
  window.open(document.fileUrl, '_blank')
}
