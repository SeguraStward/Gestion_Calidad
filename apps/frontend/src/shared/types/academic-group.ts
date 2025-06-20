import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (academicLoads)
export type GroupWithRelations = Prisma.AcademicLoadGroupGetPayload<{
  include: {
    academicLoads: true
  }
}>

// Type for creating a Group (omit id, version, createdAt, updatedAt, and relations)
export type CreateGroupInput = Omit<
  Prisma.AcademicLoadGroupCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'academicLoads'
> & {
  academicLoads?: { connect: { id: string }[] }
}

// Type for updating a Group (partial of create)
export type UpdateGroupInput = Partial<CreateGroupInput>
