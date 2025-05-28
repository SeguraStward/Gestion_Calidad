export interface ErrorResponse {
  message: string
  statusCode: number
  errors?: Array<{
    field?: string
    message: string
    code?: string
  }>
  timestamp?: string
  path?: string
}
