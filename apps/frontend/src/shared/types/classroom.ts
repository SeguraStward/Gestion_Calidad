import { Prisma, Status } from '@una-gc/database/prisma/generated/client'

// Type with all relations (campus, academicLoads)
export type ClassroomWithRelations = Prisma.ClassroomGetPayload<{
  include: {
    campus: true
    academicLoads: true
  }
}>

// Type for creating a Classroom (omit id, version, createdAt, updatedAt, and relations)
export type CreateClassroomInput = Omit<
  Prisma.ClassroomCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'campus' | 'academicLoads'
> & {
  campus: { connect: { id: string } }
  academicLoads?: { connect: { id: string }[] }
}

// Type for updating a Classroom (partial of create)
export type UpdateClassroomInput = Partial<CreateClassroomInput>

export interface StrictCreateClassroomInput {
  roomNumber: string
  capacity: number
  description?: string | null
  campusId: string
  status: Status
}

export interface StrictCreateClassroomOutput {
  roomNumber: string
  capacity: number
  description?: string | null
  campusId: string
  status: Status
}
