import { Prisma } from "@una-gc/database/prisma/generated/client";

// Define a base type for Course and Professor if they are not already globally available
// For now, using simplified versions as in useProfessorAssignments.ts
export interface SimpleCourse {
  id: string;
  name: string;
  // Add other relevant course fields if needed for display or logic
}

export interface SimpleProfessor {
  id: string;
  name: string; // Assuming User model has a name, or combine from other fields
  // Add other relevant professor fields if needed
}

// Placeholder types - these should ideally be defined in a central types location or within the academic-maintenance module
// If they are defined in Prisma, import them from there.
export interface AcademicCycle { id: string; name: string; year: number; cycleNumber: string; startDate: string; endDate: string; status: string }
export interface AcademicLoadGroup { id: string; name: string; } // Example: A, B, C
export interface Schedule { id: string; dayOfWeek: string; startTime: string; endTime: string; }

export type AcademicLoadWithRelations = Prisma.AcademicLoadGetPayload<{
  include: {
    academicCycle: true;
    campus: true;
    course: true; // Prisma will include the full Course model based on schema
    classroom: true;
    group: true; // AcademicLoadGroup
    schedule: true;
    professor: true; // Prisma will include the full User model for professor
  };
}>;

// Type for creating an AcademicLoad. Adjust fields as necessary.
// This should align with the fields required by your backend/service.
export type CreateAcademicLoadInput = Omit<
  Prisma.AcademicLoadCreateInput,
  // Omit fields that are auto-generated or handled by relations differently
  | 'id'
  | 'version'
  | 'createdAt'
  | 'updatedAt'
  | 'academicCycle' // Handled by academicCycleId
  | 'campus' // Handled by campusId
  | 'course' // Handled by courseId
  | 'classroom' // Handled by classroomId (optional)
  | 'group' // Handled by groupId
  | 'schedule' // Handled by scheduleId (optional)
  | 'professor' // Handled by professorId
> & {
  // Explicitly define connect syntax for relations if needed by service,
  // or just IDs if service handles connection.
  // For simplicity, assuming direct IDs are sufficient for the service layer for now.
  academicCycleId: string;
  campusId: string;
  courseId: string;
  groupId: string;
  professorId: string;
  // classroomId and scheduleId are optional in prisma schema
};

// Type for updating an AcademicLoad.
export type UpdateAcademicLoadInput = Partial<CreateAcademicLoadInput>;

// Re-exporting simplified types for selection lists, if still needed
export type { SimpleCourse as CourseSelectOption, SimpleProfessor as ProfessorSelectOption };
