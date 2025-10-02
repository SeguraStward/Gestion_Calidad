import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'

export interface CareerProofDocument {
  id: string
  careerId: string
  proofDocumentId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateCareerProofDocumentDto {
  careerId: string
  proofDocumentId: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateCareerProofDocumentDto {
  careerId?: string
  proofDocumentId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export const careerProofDocumentService = new GenericService<
  CareerProofDocument,
  CreateCareerProofDocumentDto,
  UpdateCareerProofDocumentDto
>('career-proof-documents')

export const {
  useList: useCareerProofDocuments,
  useOne: useCareerProofDocument,
  useCreate: useCreateCareerProofDocument,
  useUpdate: useUpdateCareerProofDocument,
  useRemove: useDeleteCareerProofDocument
} = createGenericHooks('career-proof-documents', careerProofDocumentService, {
  messages: {
    created: () => 'Relación carrera-documento creada con éxito',
    updated: () => 'Relación carrera-documento actualizada con éxito',
    deleted: () => 'Relación carrera-documento eliminada con éxito'
  }
})
