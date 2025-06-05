import { Prisma } from '@una-gc/database/prisma/generated/client'

export type FacultyWithRelations = Prisma.FacultyGetPayload<{
  include: {
    schools: true
  }
}>

export type CreateFacultyInput = Omit<Prisma.FacultyCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  schools?: { connect: { id: string }[] }
}
