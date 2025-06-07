import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with main relations (roles, academicLoads, userLanguages, workExperiences, etc.)
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    roles: true
    academicLoads: true
    userLanguages: true
    workExperiences: true
    // Agrega aquí otras relaciones si las necesitas en el frontend
  }
}>

// Type for creating a User (omit id, version, createdAt, updatedAt, and relations)
export type CreateUserInput = Omit<
  Prisma.UserCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'roles' | 'academicLoads' | 'userLanguages' | 'workExperiences'
> & {
  roles?: { connect: { id: string }[] }
  academicLoads?: { connect: { id: string }[] }
  userLanguages?: { connect: { id: string }[] }
  workExperiences?: { connect: { id: string }[] }
}

// Type for updating a User (partial of create)
export type UpdateUserInput = Partial<CreateUserInput>
