export interface Component {
  id: string
  name: string
  code: string
  description: string
  order: number
  dimensionId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateComponentDto {
  name: string
  code: string
  description: string
  order: number
  dimensionId: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateComponentDto {
  name?: string
  code?: string
  description?: string
  order?: number
  dimensionId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
