import { Prisma } from '@una-gc/database/prisma/generated/client'

export type AcademicCycleWithRelations = Prisma.AcademicCycleGetPayload<{
  include: {
    academicLoads: true
  }
}>

export type CreateAcademicCycleInput = Omit<Prisma.AcademicCycleCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}
