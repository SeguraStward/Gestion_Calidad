import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import type {
  CreateQualityEvidenceDto,
  QualityEvidence,
  UpdateQualityEvidenceDto
} from '../types/quality-evidences.types'

export const qualityEvidenceService = new GenericService<
  QualityEvidence,
  CreateQualityEvidenceDto,
  UpdateQualityEvidenceDto
>('quality-evidences')

export const {
  useList: useQualityEvidences,
  useOne: useQualityEvidence,
  useCreate: useCreateQualityEvidence,
  useUpdate: useUpdateQualityEvidence,
  useRemove: useDeleteQualityEvidence
} = createGenericHooks('quality-evidences', qualityEvidenceService, {
  messages: {
    created: () => 'Evidencia de calidad creada con éxito',
    updated: () => 'Evidencia de calidad actualizada con éxito',
    deleted: () => 'Evidencia de calidad eliminada con éxito'
  },
  silent: { remove: { error: true } }
})
