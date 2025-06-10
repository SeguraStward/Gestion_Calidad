import { GenericService } from '@/services/base/generic.service'
import { CareerWithRelations, CreateCareerInput } from '../types/career'

export class CareerService extends GenericService<CareerWithRelations, CreateCareerInput, Partial<CreateCareerInput>> {
  constructor() {
    super('careers')
  }
}

export const careerService = new CareerService()
