import { createGenericHooks } from '@/services/base/generic.hooks'
import { classroomService } from '../services/classroom.service'
import { ClassroomWithRelations, CreateClassroomInput } from '@/shared/types/classroom'

export interface ClassroomFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const {
  useList: useListClassrooms,
  useOne: useOneClassroom,
  useCreate: useCreateClassroom,
  useUpdate: useUpdateClassroom,
  useRemove: useRemoveClassroom
} = createGenericHooks<ClassroomWithRelations, CreateClassroomInput, Partial<CreateClassroomInput>, ClassroomFilters>(
  'classrooms',
  classroomService,
  {
    messages: {
      created: () => 'Aula creada exitosamente',
      updated: () => 'Aula actualizada exitosamente',
      deleted: () => 'Aula eliminada exitosamente'
    }
  }
)
