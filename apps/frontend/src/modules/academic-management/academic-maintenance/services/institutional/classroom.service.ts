import { GenericService } from '@/services/base/generic.service'
import { ClassroomWithRelations, CreateClassroomInput } from '../../types/institutional/classroom'

export class ClassroomService extends GenericService<
  ClassroomWithRelations,
  CreateClassroomInput,
  Partial<CreateClassroomInput>
> {
  constructor() {
    super('classrooms')
  }
}

export const classroomService = new ClassroomService()
