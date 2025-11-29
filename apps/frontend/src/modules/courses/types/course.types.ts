/**
 * Course types for frontend
 */

export interface CourseRowDto {
  codigo: string
  nombre: string
  creditos: number
  nivel: number
  horasContacto: number
  horasIndependientes?: number
  descripcion?: string
}

export interface BulkImportCoursesDto {
  courses: CourseRowDto[]
}

export interface BulkImportCoursesResultDto {
  created: number
  updated: number
  errors: number
  errorDetails: string[]
  courseIds: string[]
}
