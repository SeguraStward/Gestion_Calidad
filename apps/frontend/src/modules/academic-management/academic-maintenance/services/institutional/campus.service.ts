import { GenericService } from '../../../../../services/base/generic.service'
import { CampusWithRelations, CreateCampusInput } from '../../types/institutional/campus'

export class CampusService extends GenericService<
  CampusWithRelations,
  CreateCampusInput,
  Partial<CreateCampusInput>
> {
  constructor() {
    super('campuses')
  }
}

export const campusService = new CampusService()
