import { Prisma } from '@una-gc/database/prisma/generated/client'

export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
    academicLoads: true
  }
}>

export type CreateScheduleInput = Omit<Prisma.ScheduleCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}
