import { HttpClient } from '@/lib/http-client'
import type { PaginatedResponse, ErrorResponse } from '../interfaces'

// Tipo para respuestas del backend que están envueltas
interface BackendResponse<T> {
  data: T
  message?: string
  status?: string
}

export class GenericService<T, CreateDTO, UpdateDTO = Partial<T>, Filters = unknown> {
  constructor(private readonly resource: string) {}

  async list(filters?: Filters): Promise<PaginatedResponse<T>> {
    try {
      const response = await HttpClient.get(`/${this.resource}`, { params: filters })
      const data = this.extractData(response.data)

      return Array.isArray(data)
        ? { data, meta: { page: 1, limit: data.length, total: data.length } }
        : (data as PaginatedResponse<T>)
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
      await HttpClient.delete(`/${this.resource}/${id}`)
    } catch (err) {
      this.handleError(err)
    }
  }

  // Método para extraer datos de la respuesta envuelta
  private extractData(responseData: any): any {
    // Si la respuesta está envuelta en { data: ... }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data
    }

    // Si la respuesta es directamente los datos
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
