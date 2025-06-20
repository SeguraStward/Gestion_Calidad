import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (schools)
export type FacultyWithRelations = Prisma.FacultyGetPayload<{
  include: {
    schools: true
  }
}>

// Type for creating a Faculty (omit id, version, createdAt, updatedAt, and relations)
export type CreateFacultyInput = Omit<Prisma.FacultyCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'schools'> & {
  schools?: { connect: { id: string }[] }
}

// Type for updating a Faculty (partial of create)
export type UpdateFacultyInput = Partial<CreateFacultyInput>
