import { HttpClient } from '@/lib/http-client'
import { CountResponse, PaginatedResponse, QueryParams } from './types/base.types'

export interface IGenericApiService<T, C, U = Partial<C>> {
  findAll(params?: QueryParams): Promise<PaginatedResponse<T>>
  findById(id: string, include?: string): Promise<T>
  findOne(where: any, include?: string): Promise<T | null>
  count(where?: any): Promise<CountResponse>
  create(data: C): Promise<T>
  update(id: string, data: U): Promise<T>
  delete(id: string): Promise<void>
  softDelete(id: string): Promise<T>
}

export abstract class BaseApiService<T, C, U = Partial<C>> implements IGenericApiService<T, C, U> {
  protected abstract readonly resourcePath: string

  async findAll(params: QueryParams = {}): Promise<PaginatedResponse<T>> {
    const queryString = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          queryString.append(key, JSON.stringify(value))
        } else {
          queryString.append(key, String(value))
        }
      }
    })

    const response = await HttpClient.get<PaginatedResponse<T>>(`${this.resourcePath}?${queryString.toString()}`)
    return response.data
  }

  async findById(id: string, include?: string): Promise<T> {
    const queryString = include ? `?include=${encodeURIComponent(include)}` : ''
    const response = await HttpClient.get<T>(`${this.resourcePath}/${id}${queryString}`)
    return response.data
  }

  async findOne(where: any, include?: string): Promise<T | null> {
    const params = new URLSearchParams()
    params.append('limit', '1')

    if (include) {
      params.append('include', include)
    }

    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const response = await HttpClient.get<PaginatedResponse<T>>(`${this.resourcePath}?${params.toString()}`)

    return response.data.data.length > 0 ? response.data.data[0]! : null
  }

  async count(where?: any): Promise<CountResponse> {
    const params = new URLSearchParams()

    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    const queryString = params.toString()
    const response = await HttpClient.get<CountResponse>(`${this.resourcePath}/count${queryString ? `?${queryString}` : ''}`)
    return response.data
  }

  async create(data: C): Promise<T> {
    const response = await HttpClient.post<T>(this.resourcePath, data)
    return response.data
  }

  async update(id: string, data: U): Promise<T> {
    const response = await HttpClient.put<T>(`${this.resourcePath}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await HttpClient.delete(`${this.resourcePath}/${id}`)
  }

  async softDelete(id: string): Promise<T> {
    const response = await HttpClient.patch<T>(`${this.resourcePath}/${id}/soft-delete`)
    return response.data
  }
}
