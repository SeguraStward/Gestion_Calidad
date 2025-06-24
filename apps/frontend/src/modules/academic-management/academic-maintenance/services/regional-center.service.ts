import { HttpClient } from '@/lib/http-client'
import { GenericService } from '@/services/base/generic.service'
import type { CreateRegionalCenterInput, RegionalCenterWithRelations, UpdateRegionalCenterInput } from '../types/regional-center'

// Define the include parameter for relations

export class RegionalCenterService extends GenericService<
  RegionalCenterWithRelations,
  CreateRegionalCenterInput,
  UpdateRegionalCenterInput
> {
  constructor() {
    super('regional-centers')
  }

  // Override get to include all relations
  override async get(id: string): Promise<RegionalCenterWithRelations> {
    const response = await HttpClient.get(`/${this.resource}/${id}`, {
      params: { include: 'campuses' }
    })
    return response.data?.data || response.data
  }

  // Override list to include all relations
  override async list(filters?: any): Promise<{ data: RegionalCenterWithRelations[]; meta: any }> {
    let page = 1
    let limit = 10
    let rest = { ...filters }
    if (filters && typeof filters.page === 'object') {
      page = filters.page.page ?? 1
      limit = filters.page.limit ?? 10
      delete rest.page
    } else {
      page = filters?.page ?? 1
      limit = filters?.limit ?? 10
      delete rest.page
      delete rest.limit
    }
    const response = await HttpClient.get(`/${this.resource}`, {
      params: {
        ...rest,
        page,
        limit,
        include: 'campuses'
      }
    })
    return response.data
  }

  // Custom method for finding by campus
  async listByCampusId(campusId: string, filters?: any) {
    let page = 1
    let limit = 10
    let rest = { ...filters }
    if (filters && typeof filters.page === 'object') {
      page = filters.page.page ?? 1
      limit = filters.page.limit ?? 10
      delete rest.page
    } else {
      page = filters?.page ?? 1
      limit = filters?.limit ?? 10
      delete rest.page
      delete rest.limit
    }
    const response = await HttpClient.get(`/${this.resource}/campus/${campusId}`, {
      params: {
        ...rest,
        page,
        limit,
        include: 'campuses'
      }
    })
    return response.data
  }
}

export const regionalCenterService = new RegionalCenterService()
