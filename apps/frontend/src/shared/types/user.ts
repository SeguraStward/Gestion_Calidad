import { Prisma } from '@una-gc/database/prisma/generated/client'

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    roles: true
    academicLoads: true
  }
}>

export type CreateUserInput = Omit<Prisma.UserCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  roles?: { connect: { id: string }[] }
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}
