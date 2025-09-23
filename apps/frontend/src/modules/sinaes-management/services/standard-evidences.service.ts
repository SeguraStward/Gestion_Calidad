import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'

export interface StandardEvidence {
  id: string
  standardId: string
  evidenceId: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateStandardEvidenceDto {
  standardId: string
  evidenceId: string
}

export interface UpdateStandardEvidenceDto {
  standardId?: string
  evidenceId?: string
}

export const standardEvidenceService = new GenericService<
  StandardEvidence,
  CreateStandardEvidenceDto,
  UpdateStandardEvidenceDto
>('standard-evidences')

export const {
  useList: useStandardEvidences,
  useOne: useStandardEvidence,
  useCreate: useCreateStandardEvidence,
  useUpdate: useUpdateStandardEvidence,
  useRemove: useDeleteStandardEvidence
} = createGenericHooks('standard-evidences', standardEvidenceService, {
  messages: {
    created: () => 'Relación estándar-evidencia creada con éxito',
    updated: () => 'Relación estándar-evidencia actualizada con éxito',
    deleted: () => 'Relación estándar-evidencia eliminada con éxito'
  }
})
