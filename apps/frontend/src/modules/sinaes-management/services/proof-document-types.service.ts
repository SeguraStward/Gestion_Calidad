import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import type {
  CreateProofDocumentTypeDto,
  ProofDocumentType,
  UpdateProofDocumentTypeDto
} from '../types/proof-document-types.types'

export const proofDocumentTypeService = new GenericService<
  ProofDocumentType,
  CreateProofDocumentTypeDto,
  UpdateProofDocumentTypeDto
>('proof-document-types')

export const {
  useList: useProofDocumentTypes,
  useOne: useProofDocumentType,
  useCreate: useCreateProofDocumentType,
  useUpdate: useUpdateProofDocumentType,
  useRemove: useDeleteProofDocumentType
} = createGenericHooks('proof-document-types', proofDocumentTypeService, {
  messages: {
    created: () => 'Tipo de documento probatorio creado con éxito',
    updated: () => 'Tipo de documento probatorio actualizado con éxito',
    deleted: () => 'Tipo de documento probatorio eliminado con éxito'
  },
  // Delete success + error toasts are shown by document-types-tab (with a custom
  // "no se puede eliminar..." message); silence the hook's so only one appears.
  silent: { remove: { success: true, error: true } }
})
