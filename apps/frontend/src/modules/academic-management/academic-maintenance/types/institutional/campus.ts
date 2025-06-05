import { Prisma } from '@una-gc/database/prisma/generated/client'

export type CampusWithRelations = Prisma.CampusGetPayload<{
  include: {
    regionalCenter: true
    classrooms: true
    academicLoads: true
  }
}>

export type CreateCampusInput = Omit<Prisma.CampusCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  regionalCenter: { connect: { id: string } }
  classrooms?: { connect: { id: string }[] }
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}
