export interface Standard {
  id: string
  name: string
  code: string
  description: string
  order: number
  criterionId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateStandardDto {
  name: string
  code: string
  description: string
  order: number
  criterionId: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateStandardDto {
  name?: string
  code?: string
  description?: string
  order?: number
  criterionId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
