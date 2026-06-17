import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import type {
  CreateStandardDto,
  Standard,
  UpdateStandardDto
} from '../types/standards.types'

export const standardService = new GenericService<
  Standard,
  CreateStandardDto,
  UpdateStandardDto
>('standards')

export const {
  useList: useStandards,
  useOne: useStandard,
  useCreate: useCreateStandard,
  useUpdate: useUpdateStandard,
  useRemove: useDeleteStandard
} = createGenericHooks('standards', standardService, {
  messages: {
    created: () => 'Estándar creado con éxito',
    updated: () => 'Estándar actualizado con éxito',
    deleted: () => 'Estándar eliminado con éxito'
  },
  // create/update toasts are shown by StandardForm itself; silence the generic
  // hook's so only one toast appears. Delete is toasted by the hook.
  silent: {
    create: { success: true, error: true },
    update: { success: true, error: true },
    remove: { error: true },
  }
})
