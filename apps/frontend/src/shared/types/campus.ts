import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (regionalCenter, classrooms, academicLoads)
export type CampusWithRelations = Prisma.CampusGetPayload<{
  include: {
    regionalCenter: true
    classrooms: true
    academicLoads: true
  }
}>

// Type for creating a Campus (omit id, version, createdAt, updatedAt, and relations)
export type CreateCampusInput = Omit<
  Prisma.CampusCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'regionalCenter' | 'classrooms' | 'academicLoads'
> & {
  regionalCenter: { connect: { id: string } }
  classrooms?: { connect: { id: string }[] }
  academicLoads?: { connect: { id: string }[] }
}

// Type for updating a Campus (partial of create)
export type UpdateCampusInput = Partial<CreateCampusInput>
