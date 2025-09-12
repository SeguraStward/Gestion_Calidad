import { HttpClient } from '@/lib/http-client'
import type { ErrorResponse, PaginatedResponse } from '../interfaces'

export class GenericService<T, CreateDTO, UpdateDTO = Partial<T>, Filters = unknown> {
  constructor(protected readonly resource: string) { }

  async list(filters?: Filters): Promise<PaginatedResponse<T>> {
    try {
      const response = await HttpClient.get<PaginatedResponse<T>>(`/${this.resource}`, { params: filters })
      // Assuming response.data from HttpClient IS the PaginatedResponse object from the API
      return response.data
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(id: string, filters?: Filters): Promise<T> {
    try {
      const response = await HttpClient.get(`/${this.resource}/${id}`, { params: filters })
      return this.extractData(response.data) as T
    } catch (err) {
      this.handleError(err)
    }
  }

  async create(payload: CreateDTO): Promise<T> {
    try {
      const response = await HttpClient.post(`/${this.resource}`, payload)
      return this.extractData(response.data) as T
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(id: string, payload: UpdateDTO): Promise<T> {
    try {
      const response = await HttpClient.put(`/${this.resource}/${id}`, payload)
      return this.extractData(response.data) as T
    } catch (err) {
      this.handleError(err)
    }
  }

  async remove(id: string): Promise<void> {
    try {
      console.log(`🔥 GenericService: Attempting to delete ${this.resource}/${id}`)
      const response = await HttpClient.delete(`/${this.resource}/${id}`)
      console.log(`✅ GenericService: Delete successful for ${this.resource}/${id}`, response)
    } catch (err) {
      console.error(`❌ GenericService: Delete failed for ${this.resource}/${id}`, err)
      this.handleError(err)
    }
  }

  // The extractData method is generally for single item responses or non-paginated list responses
  // that might be wrapped in a { data: ... } structure by the backend.
  // For paginated lists, we usually want the whole { data: [...], meta: {...} } object.
  private extractData(responseData: any): any {
    // If the responseData is an object and has a 'data' key,
    // AND it does NOT have a 'meta' key (to distinguish from PaginatedResponse)
    if (responseData && typeof responseData === 'object' && 'data' in responseData && !('meta' in responseData)) {
      return responseData.data
    }
    return responseData
  }

  private handleError(err: any): never {
    if (err.response?.data) {
      throw err.response.data as ErrorResponse
    }

    if (err.message) {
      throw {
        message: err.message,
        statusCode: err.response?.status || 500
      } as ErrorResponse
    }

    throw {
      message: 'Error desconocido',
      statusCode: 500
    } as ErrorResponse
  }
}
