// Types for proof documents and queries

export interface ProofDocument {
  id: string
  code: string // CONV-001, ACT-002, etc.
  name: string
  description?: string
  fileUrl: string // Google Drive URL
  fileName: string // CONV-001_original-name.pdf
  fileType: string // pdf, doc, docx, etc.
  fileSize: number
  evidenceId: string
  proofDocumentTypeId: string
  googleDriveFileId: string
  googleDriveFolderId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string

  // Relations
  evidence?: {
    id: string
    code: string
    name: string
    criterionId?: string
    standardId?: string
    criterion?: {
      id: string
      code: string
      name: string
      componentId: string
      component?: {
        id: string
        code: string
        name: string
        dimensionId: string
        dimension?: {
          id: string
          code: string
          name: string
        }
      }
    }
    standard?: {
      id: string
      code: string
      name: string
      criterionId: string
    }
  }
  proofDocumentType?: {
    id: string
    name: string
    prefix: string
  }
  careerProofDocuments?: Array<{
    id: string
    careerId: string
    career?: {
      id: string
      name: string
      code: string
    }
  }>
}

export interface ProofDocumentFilters {
  search?: string
  dimensionId?: string
  componentId?: string
  criterionId?: string
  standardId?: string
  evidenceId?: string
  proofDocumentTypeId?: string
  careerIds?: string[]
  dateFrom?: string
  dateTo?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface ProofDocumentsResponse {
  data: ProofDocument[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
