/**
 * Status for Final Reports, aligning with Prisma's FinalReportStatus
 * and potentially including frontend-specific display values if needed.
 */
export type FinalReportStatusFE = 'PENDING' | 'EVALUATED' | 'DRAFT' | 'REVIEW' | 'OBSERVATIONS' | 'APPROVED' | string // string for flexibility with mock data

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
  name: string // Assuming 'name' from AcademicCycle is used as 'descripcion'
  description?: string
  year?: number
  startDate?: string // ISO date string
  endDate?: string // ISO date string
}

/**
 * Nested Professor information within AcademicLoad.
 */
export interface ProfessorNested {
  id: string
  name: string
  // Add other fields like email, idNumber if needed for display
}

/**
 * Represents the AcademicLoad information as nested within a FinalReport.
 * This structure should match what your backend includes.
 */
export interface AcademicLoadNestedInReport {
  id: string
  nrc: string
  date?: string // ISO date string, from AcademicLoad.date
  course: CourseNested
  academicCycle: AcademicCycleNested
  professor?: ProfessorNested // If included by the backend
  // Add other fields from AcademicLoad if needed (e.g., campus, classroom, schedule)
  // campus?: { id: string; name: string; code?: string };
  // classroom?: { id: string; roomNumber: string; };
  // schedule?: { id: string; dayOfWeek: string; startTime: string; endTime: string };
  groupId?: string
}

/**
 * Represents the statistics part of a FinalReport.
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
  id: string // FinalReport ID
  status: FinalReportStatusFE // FinalReport.status
  createdAt: string // FinalReport.createdAt (ISO date string)
  updatedAt?: string // FinalReport.updatedAt (ISO date string)
  version?: number

  // Nested data from relations
  academicLoad: AcademicLoadNestedInReport // Corresponds to FinalReport.academicLoad
  statistics: FinalReportStatisticsFE // Corresponds to FinalReport.statistics
  professor?: ProfessorNested // Direct relation from FinalReport.professor if backend sends it separately
  // Or it might be inside academicLoad.professor
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
  otherResponse?: string // Optional based on Prisma schema (String vs String?)
  question: string
  response?: string // Optional
  multipleResponse?: string[] // Optional
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
export interface FullFinalReport extends FinalReportTableItem {
  // academicLoad and statistics are inherited from FinalReportTableItem
  evaluation: FinalReportEvaluationFE[]
  studentInformation: FinalReportStudentInformationFE

  // Foreign keys if needed, though often the objects are preferred
  academicLoadId: string
  professorId: string

  // Audit fields from the main FinalReport model if not already in FinalReportTableItem
  createdBy?: string
  updatedBy?: string
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
  status?: FinalReportStatusFE // Often defaults on backend
  // version is usually handled by backend
}

/**
 * DTO for updating an existing Final Report.
 * Typically a partial of the full data.
 */
export type UpdateFinalReportDto = Partial<Omit<FullFinalReport, 'id' | 'academicLoad' | 'createdAt' | 'createdBy'>>

/**
 * Specific filters for querying Final Reports, if any.
 */
export interface FinalReportFilters {
  page?: number
  limit?: number
  professorId?: string
  academicCycleId?: string
  campusId?: string
  status?: FinalReportStatusFE
  // Add other potential filter fields, e.g., nrc, courseCode
  nrc?: string
  courseCode?: string
}
