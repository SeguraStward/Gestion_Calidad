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
  // Backend always returns fileSize on upload — kept required to match the
  // canonical type in ../types/proof-documents.types.ts and avoid "N/A" cells
  // for documents that actually have a size.
  fileSize: number
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
 * Shape returned by `GET /proof-documents/:id/deletion-preview`.
 * Mirrors the DTO in proof-documents.service.ts (backend).
 */
export interface ProofDocumentDeletionPreview {
  document: { id: string; code: string; name: string; fileName: string }
  careerCount: number
  careerNames: string[]
  driveFiles: Array<{ id: string; name: string; mimeType: string; isFolder: boolean }>
  uploadFolder: { id: string | null; willBeDeleted: boolean }
  typeFolder: { id: string | null; willBeDeleted: boolean }
  isLegacyDocument: boolean
}

/**
 * Loads a description of the side-effects an `eliminar` action would have on
 * Drive + DB. Runs only when an id is provided AND `enabled` is true (so we
 * don't fire on every render of the table).
 */
export const useProofDocumentDeletionPreview = (
  documentId: string | undefined,
  enabled = true,
) => {
  return useQuery<ProofDocumentDeletionPreview>({
    queryKey: ['proof-documents', documentId, 'deletion-preview'],
    queryFn: async () => {
      const response = await HttpClient.get<ProofDocumentDeletionPreview>(
        `/proof-documents/${documentId}/deletion-preview`,
      )
      return response.data
    },
    enabled: !!documentId && enabled,
    staleTime: 0, // always fresh — the user is about to act on it
  })
}

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

/**
 * Update document careers
 */
export const updateDocumentCareers = async (
  documentId: string,
  careerIds: string[]
): Promise<{ success: boolean; message: string }> => {
  const response = await HttpClient.post(`/proof-documents/${documentId}/careers`, {
    careerIds,
  })
  return response.data
}

/**
 * Replace document file
 */
export const replaceDocumentFile = async (
  documentId: string,
  file: File
): Promise<ProofDocument> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await HttpClient.post<ProofDocument>(
    `/proof-documents/${documentId}/replace-file`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}
