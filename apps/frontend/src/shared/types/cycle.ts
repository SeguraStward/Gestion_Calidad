import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (academicLoads, Project)
export type AcademicCycleWithRelations = Prisma.AcademicCycleGetPayload<{
  include: {
    academicLoads: true
    Project: true
  }
}>

// Type for creating an AcademicCycle (omit id, version, createdAt, updatedAt, and relations)
export type CreateAcademicCycleInput = Omit<
  Prisma.AcademicCycleCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'academicLoads' | 'Project'
> & {
  academicLoads?: { connect: { id: string }[] }
  Project?: { connect: { id: string }[] }
}

// Type for updating an AcademicCycle (partial of create)
export type UpdateAcademicCycleInput = Partial<CreateAcademicCycleInput>
