import { HttpClient } from '@/lib/http-client'
import { GenericService } from '@/services/base/generic.service'
import type {
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput,
} from '../../types/institutional/regional-center'

// Define the include parameter for relations
const FULL_INCLUDE = {
  campuses: true,
}

export class RegionalCenterService extends GenericService<
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput
> {
  constructor() {
    super('regional-centers')
  }

  // Override get to include all relations
  async get(id: string): Promise<RegionalCenterWithRelations> {
    const response = await HttpClient.get(`/${this.resource}/${id}`, {
      params: { include: JSON.stringify(FULL_INCLUDE) }
    })
    return response.data?.data || response.data
  }

  // Override list to include all relations
  async list(filters?: any): Promise<{ data: RegionalCenterWithRelations[]; meta: any }> {
    const response = await HttpClient.get(`/${this.resource}`, { 
      params: { 
        ...filters,
        include: JSON.stringify(FULL_INCLUDE)
      }
    })
    return response.data
  }

  // Custom method for finding by campus
  async listByCampusId(campusId: string, filters?: any) {
    const response = await HttpClient.get(`/${this.resource}/campus/${campusId}`, { 
      params: { 
        ...filters,
        include: JSON.stringify(FULL_INCLUDE)
      }
    })
    return response.data
  }
}

export const regionalCenterService = new RegionalCenterService()