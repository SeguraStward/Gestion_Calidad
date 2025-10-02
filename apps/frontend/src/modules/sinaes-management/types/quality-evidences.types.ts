export interface QualityEvidence {
  id: string
  name: string
  code: string
  description: string
  order: number
  standardId?: string
  criterionId?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateQualityEvidenceDto {
  name: string
  code: string
  description: string
  order: number
  standardId?: string
  criterionId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateQualityEvidenceDto {
  name?: string
  code?: string
  description?: string
  order?: number
  standardId?: string
  criterionId?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
