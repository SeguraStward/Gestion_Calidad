// Basic types for related entities - expand as needed or import from shared types if they exist
interface Course {
  id: string
  code: string
  name: string
  // ... other course properties
}

interface Professor {
  id: string
  fullName?: string | null // Assuming from your authStore User type
  // ... other professor properties
}

interface AcademicCycle {
  id: string
  name: string
  year?: number
  // ... other academic cycle properties
}

interface Group {
  id: string
  number: string // Or however group is identified
  // ... other group properties
}

export type AcademicLoadStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' // Matches backend Status enum

// Represents a full academic load with potential includes
export interface FullAcademicLoad {
  id: string
  nrc: string
  maximumCapacity: number
  enrolledCapacity: number
  availableSeats: number
  date?: string | null // Assuming ISO string
  status: AcademicLoadStatus
  professorId?: string // Foreign key
  courseId?: string // Foreign key
  academicCycleId?: string // Foreign key
  groupId?: string // Foreign key

  // Optional included relations
  course?: Course | null
  professor?: Professor | null
  academicCycle?: AcademicCycle | null
  group?: Group | null

  // Timestamps if available
  createdAt?: string
  updatedAt?: string
}

// For creating (if you implement POST later)
export interface CreateAcademicLoadDto {
  nrc: string
  maximumCapacity: number
  // ... other required fields for creation
  professorId: string
  courseId: string
  academicCycleId: string
  groupId: string
  status?: AcademicLoadStatus
}

// For updating (if you implement PUT later)
export interface UpdateAcademicLoadDto extends Partial<CreateAcademicLoadDto> {
  // Specific update fields, often all are partial
}

// Filters for fetching academic loads
export interface AcademicLoadFilters {
  page?: number
  limit?: number
  orderBy?: string // e.g., '{"nrc":"asc"}'
  include?: string // e.g., 'course,professor,academicCycle,group'
  status?: AcademicLoadStatus
  professorId?: string // To filter by professor
  // ... any other filterable fields
}
