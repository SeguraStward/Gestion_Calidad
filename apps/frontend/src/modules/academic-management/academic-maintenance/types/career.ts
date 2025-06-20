import { Prisma, Status } from '@una-gc/database/prisma/generated/client'

// Type with all relations (school, courses, projects)
export type CareerWithRelations = Prisma.CareerGetPayload<{
  include: {
    school: true
    courses: true
    projects: true
  }
}>

// Type for creating a Career (omit id, version, createdAt, updatedAt, and relations)
export type CreateCareerInput = {
  code: string
  name: string
  schoolId: string
  status: Status
}

// Type for updating a Career (partial of create)
export type UpdateCareerInput = Partial<CreateCareerInput>
