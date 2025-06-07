import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type completo de curso con relaciones principales
export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    career: true
    academicLoads: true
  }
}>

// Type para crear un curso (ajustado al patrón de campus/classroom)
export type CreateCourseInput = Omit<Prisma.CourseCreateInput, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
  career?: { connect: { id: string } }
  academicLoads?: { connect: { id: string }[] }
  createdBy?: string | null
  updatedBy?: string | null
}

// Type simplificado para selects
export type CourseSelectOption = Pick<CourseWithRelations, 'id' | 'name' | 'code' | 'credits' | 'status'>
