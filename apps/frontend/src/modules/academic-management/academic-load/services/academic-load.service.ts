import HttpClient from '@/lib/http-client'
import { GenericService } from '@/services/base/generic.service'

import type {
  AcademicLoadWithRelations,
  BulkImportAcademicLoadsDto,
  BulkImportAcademicLoadsResultDto,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput
} from '../types/academic-load'

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
  override async create(payload: CreateAcademicLoadInput): Promise<AcademicLoadWithRelations> {
    // Calculate available seats
    const availableSeats = payload.maximumCapacity - payload.enrolledCapacity

    // Process the date to ensure it's in ISO format
    const processedPayload = {
      ...payload,
      availableSeats,
      // Ensure date is properly formatted if it exists
      ...(payload.date && {
        date: payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString()
      })
    }

    console.log('Creating academic load with payload:', processedPayload) // Debug log

    const response = await HttpClient.post(`/${this.resource}`, processedPayload)
    const result = response.data?.data || response.data
    console.log('Academic Load create response:', result) // Debug log
    return result
  }

  // Override update to handle relations
  override async update(id: string, payload: UpdateAcademicLoadInput): Promise<AcademicLoadWithRelations> {
    // If capacity fields are being updated, calculate available seats
    let data = { ...payload }
    if (payload.maximumCapacity !== undefined || payload.enrolledCapacity !== undefined) {
      const current = await this.get(id)
      const maxCapacity = payload.maximumCapacity ?? current.maximumCapacity
      const enrolled = payload.enrolledCapacity ?? current.enrolledCapacity
      data.availableSeats = maxCapacity - enrolled
    }

    // Process the date to ensure it's in ISO format if present
    if (payload.date !== undefined) {
      if (payload.date === null) {
        data.date = null
      } else {
        data.date = payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString()
      }
    }

    console.log('Updating academic load with payload:', data) // Debug log

    const response = await HttpClient.put(`/${this.resource}/${id}`, data)
    const result = response.data?.data || response.data
    console.log('Academic Load update response:', result) // Debug log
    return result
  }

  // Override get to include all relations
  override async get(id: string): Promise<AcademicLoadWithRelations> {
    const response = await HttpClient.get(`/${this.resource}/${id}`, {
      params: { include: JSON.stringify(FULL_INCLUDE) }
    })
    const result = response.data?.data || response.data
    console.log('Academic Load get response:', result) // Debug log
    return result
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

  // Bulk import academic loads from Excel data
  async bulkImportAcademicLoads(importDto: BulkImportAcademicLoadsDto): Promise<BulkImportAcademicLoadsResultDto> {
    console.log('Bulk importing academic loads:', importDto) // Debug log
    const response = await HttpClient.post(`/${this.resource}/bulk-import`, importDto)
    const result = response.data?.data || response.data
    console.log('Bulk import response:', result) // Debug log
    return result
  }
}

export const academicLoadService = new AcademicLoadService()
