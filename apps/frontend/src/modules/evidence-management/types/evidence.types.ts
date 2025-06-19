export type DimensionType = {
  id: string
  code: string
  name: string
  description?: string
  order: number
}

export type ComponentType = {
  id: string
  code: string
  name: string
  description?: string
  dimensionId: string
  order: number
}

export type CriterionType = {
  id: string
  code: string
  name: string
  description?: string
  componentId: string
  order: number
}

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE'

export type EvidenceType = {
  id: string
  title: string
  description?: string
  fileType: string
  fileSize: number
  fileName: string
  driveFileId: string
  driveFileLink: string
  year: number
  month?: number
  keywords: string[]
  careerIds: string[]
  status: EvidenceStatus
  createdAt: string
  updatedAt: string
  createdBy?: string
  criteria: {
    criterionId: string
    notes?: string
  }[]
}

export type EvidenceFormData = {
  title: string
  description: string
  file?: File
  year: number
  month?: number
  keywords: string
  criteriaIds: string[]
  careerIds: string[]
  notes: string | ""
}

export type CareerType = {
  id: string
  name: string
  code: string
  degree?: string
}