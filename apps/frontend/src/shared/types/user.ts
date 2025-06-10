import type {
  User as PrismaUser,
  UserRole,
  UserLanguage,
  UserWorkExperience,
  AcademicLoad,
  Province,
  UserStatus,
  UserPhone
} from '@una-gc/database/prisma/generated/client'

// Incluye relaciones principales
export type UserWithRelations = PrismaUser & {
  roles: UserRole[]
  academicLoads: AcademicLoad[]
  userLanguages: UserLanguage[]
  workExperiences: UserWorkExperience[]
}

// Input para crear usuario (sin campos automáticos y relaciones directas)
export type CreateUserInput = Omit<
  PrismaUser,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'roles' | 'academicLoads' | 'userLanguages' | 'workExperiences'
> & {
  roles?: { connect: { id: string }[] }
  academicLoads?: { connect: { id: string }[] }
  userLanguages?: { connect: { id: string }[] }
  workExperiences?: { connect: { id: string }[] }
}

// Input para actualizar usuario (parcial)
export type UpdateUserInput = Partial<CreateUserInput>

// Exporta enums útiles
export type { Province, UserStatus, UserPhone }
