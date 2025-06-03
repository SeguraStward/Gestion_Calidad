import { GenericService } from '../../../../../services/base/generic.service'
import { RegionalCenterWithRelations, CreateRegionalCenterInput } from '@/modules/academic-management/academic-maintenance/types/institutional/regional-center'

export class RegionalCenterService extends GenericService<
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  Partial<CreateRegionalCenterInput>
> {
  constructor() {
    super('regional-centers')
  }
}

export const regionalCenterService = new RegionalCenterService()