import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'

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
  UpdateProofDocumentDto
>('proof-documents')

export const {
  useList: useProofDocuments,
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
