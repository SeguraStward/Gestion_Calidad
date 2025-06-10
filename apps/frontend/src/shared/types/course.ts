import { Prisma } from '@una-gc/database/prisma/generated/client'
import { Status } from '@una-gc/database/prisma/generated/client'

// Type with all relations (career, academicLoads)
export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    career: true
    academicLoads: true
  }
}>

// Type for creating a Course (omit id, version, createdAt, updatedAt, and relations)
export type CreateCourseInput = Omit<
  Prisma.CourseCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'career' | 'academicLoads'
> & {
  career?: { connect: { id: string } }
  academicLoads?: { connect: { id: string }[] }
}

// Type for updating a Course (partial of create)
export type UpdateCourseInput = Partial<CreateCourseInput>

// Type simplificado para selects
export type CourseSelectOption = Pick<CourseWithRelations, 'id' | 'name' | 'code' | 'credits' | 'status'>

export interface StrictCreateCourseInput {
  code: string
  name: string
  description?: string | null
  credits: number
  level: number
  contactHours: number
  independentHours?: number | null
  careerId?: string
  status: Status
}

export interface StrictCreateCourseOutput {
  code: string
  name: string
  description?: string | null
  credits: number
  level: number
  contactHours: number
  independentHours?: number | null
  careerId?: string
  status: Status
}
