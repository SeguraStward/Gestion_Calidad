import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import type {
  CreateComponentDto,
  Component,
  UpdateComponentDto
} from '../types/components.types'

export const componentService = new GenericService<
  Component,
  CreateComponentDto,
  UpdateComponentDto
>('components')

export const {
  useList: useComponents,
  useOne: useComponent,
  useCreate: useCreateComponent,
  useUpdate: useUpdateComponent,
  useRemove: useDeleteComponent
} = createGenericHooks('components', componentService, {
  messages: {
    created: () => 'Componente creado con éxito',
    updated: () => 'Componente actualizado con éxito',
    deleted: () => 'Componente eliminado con éxito'
  }
})
