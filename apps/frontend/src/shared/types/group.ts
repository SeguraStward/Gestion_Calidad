import { Prisma } from '@una-gc/database/prisma/generated/client'

export type GroupWithRelations = Prisma.AcademicLoadGroupGetPayload<{
  include: {
    AcademicLoad: true
  }
}>

export type CreateGroupInput = Omit<Prisma.AcademicLoadGroupCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  AcademicLoad?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
} 