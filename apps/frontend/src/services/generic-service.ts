import { HttpClient } from '@/lib/http-client'

export type BaseEntity = {
  id: number | string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export class GenericService<T extends BaseEntity, CreateDTO = Omit<T, 'id'>, UpdateDTO = Partial<Omit<T, 'id'>>> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async findAll(page = 1, limit = 10, where?: any, orderBy?: any): Promise<PaginatedResponse<T>> {
    const params: Record<string, any> = { page, limit }
    if (where) params.where = JSON.stringify(where)
    if (orderBy) params.orderBy = JSON.stringify(orderBy)

    const queryParams = `?${new URLSearchParams(params).toString()}`
    return HttpClient.get<PaginatedResponse<T>>(`${this.endpoint}${queryParams}`)
  }

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return HttpClient.get<T[]>(`${this.endpoint}${queryParams}`)
  }

  async findById(id: number | string): Promise<T> {
    return HttpClient.get<T>(`${this.endpoint}/${id}`)
  }

  async getById(id: number | string): Promise<T> {
    return this.findById(id)
  }

  async create(data: CreateDTO): Promise<T> {
    return HttpClient.post<T>(this.endpoint, data)
  }

  async update(id: number | string, data: UpdateDTO): Promise<T> {
    return HttpClient.put<T>(`${this.endpoint}/${id}`, data)
  }

  async delete(id: number | string): Promise<boolean> {
    await HttpClient.delete(`${this.endpoint}/${id}`)
    return true
  }

  // Método para implementar servicios personalizados
  protected async customEndpoint<ResponseType>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: any
  ): Promise<ResponseType> {
    const url = `${this.endpoint}${path}`

    switch (method) {
      case 'GET':
        return HttpClient.get<ResponseType>(url)
      case 'POST':
        return HttpClient.post<ResponseType>(url, data)
      case 'PUT':
        return HttpClient.put<ResponseType>(url, data)
      case 'PATCH':
        return HttpClient.put<ResponseType>(url, data)
      case 'DELETE':
        return HttpClient.delete<ResponseType>(url)
    }
  }
}
