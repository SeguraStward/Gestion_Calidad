// Base API response types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface CountResponse {
  count: number
}

// Generic API query parameters
export interface QueryParams {
  page?: number
  limit?: number
  orderBy?: string
  include?: string
  [key: string]: any
}

// Error types
export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: any
}

// Base entity with audit fields
export interface AuditFields {
  version: number
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}
