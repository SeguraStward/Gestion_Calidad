import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (AcademicLoad)
export type GroupWithRelations = Prisma.AcademicLoadGroupGetPayload<{
  include: {
    AcademicLoad: true
  }
}>

// Type for creating a Group (omit id, version, createdAt, updatedAt, and relations)
export type CreateGroupInput = Omit<
  Prisma.AcademicLoadGroupCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'AcademicLoad'
> & {
  AcademicLoad?: { connect: { id: string }[] }
}

// Type for updating a Group (partial of create)
export type UpdateGroupInput = Partial<CreateGroupInput>
