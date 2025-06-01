import type { FullAcademicLoad } from '../../academic-loads/types/academic-loads.types' // Corrected import

/**
 * Status for Final Reports, aligning with Prisma's FinalReportStatus
 * and potentially including frontend-specific display values if needed.
 */
export type FinalReportStatusFE = 'PENDING' | 'EVALUATED' | 'ACTIVE' // Matches backend

/**
 * Nested Course information within AcademicLoad.
 */
export interface CourseNested {
  id: string
  code: string
  name: string
  level?: string
  credits?: number
}

/**
 * Nested AcademicCycle information within AcademicLoad.
 */
export interface AcademicCycleNested {
  id: string
  name: string
  description?: string
  year?: number
  startDate?: string
  endDate?: string
}

/**
 * Nested Professor information within AcademicLoad.
 */
export interface ProfessorNested {
  id: string
  name: string
}

/**
 * Represents the AcademicLoad information as nested within a FinalReport.
 * This structure should match what your backend includes.
 */
export interface AcademicLoadNestedInReport {
  id: string
  nrc: string
  date?: string
  course: CourseNested
  academicCycle: AcademicCycleNested
  professor?: ProfessorNested
  groupId?: string
}

/**
 * Represents the statistics part of a Final Report.
 */
export interface FinalReportStatisticsFE {
  passed: number
  failed: number
  dropouts: number
  totalStudents: number
}

/**
 * Represents a single Final Report item for display in the table.
 * This is the primary type for the `data` array in `PaginatedResponse<FinalReportTableItem>`.
 */
export interface FinalReportTableItem {
  id: string
  status: FinalReportStatusFE
  createdAt: string
  updatedAt?: string
  version?: number
  academicLoad: AcademicLoadNestedInReport
  statistics: FinalReportStatisticsFE
  professor?: ProfessorNested
}

// --- Detailed types for Form Data (when fetching a single report for editing) ---

export interface FinalReportEvaluationOptionFE {
  category: string
  label: string
  value: string
}

export interface FinalReportEvaluationFE {
  questionGroup: string
  questionId: string
  options: FinalReportEvaluationOptionFE[]
  otherResponse?: string
  question: string
  response?: string
  multipleResponse?: string[]
  responseType: string
}

export interface FinalReportStudentAdjustmentFE {
  support: string
  idNumber: string
  name: string
  grade: string
  observation: string
}

export interface FinalReportStudentSafeguardFE {
  idNumber: string
  name: string
  grade: string
  observation: string
}

export interface FinalReportStudentInformationFE {
  adjustments: FinalReportStudentAdjustmentFE[]
  safeguards: FinalReportStudentSafeguardFE[]
}

/**
 * Represents the full, detailed Final Report data, typically used for editing.
 * This is what `finalReportService.get(id)` would return.
 */
export interface FullFinalReport {
  id: string
  version: number
  statistics: FinalReportStatisticsFE
  evaluation: FinalReportEvaluationFE[]
  studentInformation: FinalReportStudentInformationFE
  status: FinalReportStatusFE
  professorId: string
  academicLoadId: string
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  academicLoad?: FullAcademicLoad | null
  professor?: {
    id: string
    fullName?: string | null
  } | null
}

/**
 * DTO for creating a new Final Report.
 * Adjust fields based on what the backend `create` endpoint expects.
 */
export interface CreateFinalReportDto {
  academicLoadId: string
  professorId: string
  statistics: FinalReportStatisticsFE
  evaluation: FinalReportEvaluationFE[]
  studentInformation: FinalReportStudentInformationFE
  status?: FinalReportStatusFE
}

/**
 * DTO for updating an existing Final Report.
 * Typically a partial of the full data.
 */
export type UpdateFinalReportDto = Partial<
  Omit<FullFinalReport, 'id' | 'academicLoad' | 'professor' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>

/**
 * Specific filters for querying Final Reports, if any.
 */
export interface FinalReportFilters {
  page?: number
  limit?: number
  orderBy?: string
  status?: FinalReportStatusFE
  professorId?: string
  academicLoadId?: string
  include?: string
}
