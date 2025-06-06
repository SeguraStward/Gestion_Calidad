import { GenericService } from '@/services/base/generic.service'
import { FacultyWithRelations, CreateFacultyInput } from '../../types/institutional/faculty'

export class FacultyService extends GenericService<FacultyWithRelations, CreateFacultyInput, Partial<CreateFacultyInput>> {
  constructor() {
    super('faculties')
  }
}

export const facultyService = new FacultyService()
