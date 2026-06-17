import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import type {
  CreateCriterionDto,
  Criterion,
  UpdateCriterionDto
} from '../types/criteria.types'

export const criterionService = new GenericService<
  Criterion,
  CreateCriterionDto,
  UpdateCriterionDto
>('criteria')

export const {
  useList: useCriteria,
  useOne: useCriterion,
  useCreate: useCreateCriterion,
  useUpdate: useUpdateCriterion,
  useRemove: useDeleteCriterion
} = createGenericHooks('criteria', criterionService, {
  messages: {
    created: () => 'Criterio creado con éxito',
    updated: () => 'Criterio actualizado con éxito',
    deleted: () => 'Criterio eliminado con éxito'
  },
  // create/update toasts are shown by CriterionForm itself; silence the generic
  // hook's so only one toast appears. Delete is toasted by the hook.
  silent: {
    create: { success: true, error: true },
    update: { success: true, error: true },
    remove: { error: true },
  }
})
