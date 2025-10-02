export interface Criterion {
  id: string
  name: string
  code: string
  description: string
  order: number
  componentId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateCriterionDto {
  name: string
  code: string
  description: string
  order: number
  componentId: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateCriterionDto {
  name?: string
  code?: string
  description?: string
  order?: number
  componentId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
