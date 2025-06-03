import {
  AcademicLoadWithRelations,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput,
} from '../types/academic-load'
import { academicLoadService } from '../services/academic-load.service'
import { createGenericHooks } from '@/services/base/generic.hooks'

export const {
  useList: useAcademicLoadList,
  useOne: useAcademicLoadOne,
  useCreate: useCreateAcademicLoad,
  useUpdate: useUpdateAcademicLoad,
  useRemove: useRemoveAcademicLoad,
} = createGenericHooks<
  AcademicLoadWithRelations,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput
>('academic-loads', academicLoadService, {
  messages: {
    created: (e) => `Carga académica "${e.course.name} - ${e.nrc}" creada exitosamente.`,
    updated: (e) => `Carga académica "${e.course.name} - ${e.nrc}" actualizada exitosamente.`,
    deleted: () => 'Carga académica eliminada exitosamente.',
  },
})
