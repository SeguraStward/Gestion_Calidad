import { Prisma } from '@una-gc/database/prisma/generated/client'

// Type with all relations (school, courses, projects)
export type CareerWithRelations = Prisma.CareerGetPayload<{
  include: {
    school: true
    courses: true
    projects: true
  }
}>

// Type for creating a Career (omit id, version, createdAt, updatedAt, and relations)
export type CreateCareerInput = Omit<
  Prisma.CareerCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'school' | 'courses' | 'projects'
> & {
  school: { connect: { id: string } }
  courses?: { connect: { id: string }[] }
  projects?: { connect: { id: string }[] }
}

// Type for updating a Career (partial of create)
export type UpdateCareerInput = Partial<CreateCareerInput>
