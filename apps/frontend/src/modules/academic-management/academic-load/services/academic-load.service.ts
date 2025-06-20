import HttpClient from '@/lib/http-client'
import { GenericService } from '@/services/base/generic.service'

import type { AcademicLoadWithRelations, CreateAcademicLoadInput, UpdateAcademicLoadInput } from '../types/academic-load'

// Define the include parameter for relations
const FULL_INCLUDE = {
  academicCycle: true,
  campus: true,
  course: true,
  classroom: true,
  group: true,
  schedule: true,
  professor: true,
  finalReport: true
}

export class AcademicLoadService extends GenericService<
  AcademicLoadWithRelations,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput
> {
  constructor() {
    super('academic-loads')
  }

  // Override create to handle relations
  async create(payload: CreateAcademicLoadInput): Promise<AcademicLoadWithRelations> {
    // Calculate available seats
    const availableSeats = payload.maximumCapacity - payload.enrolledCapacity

    const data = {
      ...payload,
      availableSeats
    }

    const response = await HttpClient.post(`/${this.resource}`, data)
    return response.data?.data || response.data
  }

  // Override update to handle relations
  async update(id: string, payload: UpdateAcademicLoadInput): Promise<AcademicLoadWithRelations> {
    // If capacity fields are being updated, calculate available seats
    let data = { ...payload }
    if (payload.maximumCapacity !== undefined || payload.enrolledCapacity !== undefined) {
      const current = await this.get(id)
      const maxCapacity = payload.maximumCapacity ?? current.maximumCapacity
      const enrolled = payload.enrolledCapacity ?? current.enrolledCapacity
      data.availableSeats = maxCapacity - enrolled
    }

    const response = await HttpClient.put(`/${this.resource}/${id}`, data)
    return response.data?.data || response.data
  }

  // Override get to include all relations
  async get(id: string): Promise<AcademicLoadWithRelations> {
    const response = await HttpClient.get(`/${this.resource}/${id}`, {
      params: { include: JSON.stringify(FULL_INCLUDE) }
    })
    return response.data?.data || response.data
  }

  // Custom method for finding by professor
  async listByProfessorId(professorId: string, filters?: any) {
    const response = await HttpClient.get(`/${this.resource}/professor/${professorId}`, {
      params: {
        ...filters,
        include: JSON.stringify(FULL_INCLUDE)
      }
    })
    return response.data
  }
}

export const academicLoadService = new AcademicLoadService()
