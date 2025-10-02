export interface ProofDocumentType {
  id: string
  code: string
  name: string
  description?: string
  prefix: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateProofDocumentTypeDto {
  code: string
  name: string
  description?: string
  prefix: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateProofDocumentTypeDto {
  code?: string
  name?: string
  description?: string
  prefix?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
