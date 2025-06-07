import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (academicLoads)
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
    academicLoads: true
  }
}>

// Type for creating a Schedule (omit id, version, createdAt, updatedAt, and relations)
export type CreateScheduleInput = Omit<
  Prisma.ScheduleCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'academicLoads'
> & {
  academicLoads?: { connect: { id: string }[] }
}

// Type for updating a Schedule (partial of create)
export type UpdateScheduleInput = Partial<CreateScheduleInput>
