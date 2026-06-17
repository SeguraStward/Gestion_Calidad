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
  // create/update toasts are shown by QualityEvidenceForm itself; silence the
  // generic hook's so only one toast appears. Delete is toasted by the hook.
  silent: {
    create: { success: true, error: true },
    update: { success: true, error: true },
    remove: { error: true },
  }
})
