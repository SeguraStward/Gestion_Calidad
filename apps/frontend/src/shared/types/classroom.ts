import { Prisma } from '@una-gc/database/prisma/generated/client'

export type ClassroomWithRelations = Prisma.ClassroomGetPayload<{
  include: {
    campus: true
    academicLoads: true
  }
}>

export type CreateClassroomInput = Omit<Prisma.ClassroomCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  campus: { connect: { id: string } }
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}
