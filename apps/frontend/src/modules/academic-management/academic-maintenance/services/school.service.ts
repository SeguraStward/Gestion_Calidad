import { GenericService } from '@/services/base/generic.service'
import { SchoolWithRelations, CreateSchoolInput } from '../types/school'

export class SchoolService extends GenericService<SchoolWithRelations, CreateSchoolInput, Partial<CreateSchoolInput>> {
  constructor() {
    super('schools')
  }
}

export const schoolService = new SchoolService()
