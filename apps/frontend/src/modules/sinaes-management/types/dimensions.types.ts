export interface Dimension {
  id: string
  name: string
  code: string
  description?: string
  order: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateDimensionDto {
  name: string
  code: string
  description?: string
  order: number
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateDimensionDto {
  name?: string
  code?: string
  description?: string
  order?: number
  status?: 'ACTIVE' | 'INACTIVE'
}
