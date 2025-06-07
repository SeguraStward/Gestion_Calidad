import { Prisma, Status } from '@una-gc/database/prisma/generated/client'

// Type with all relations (faculty, career)
export type SchoolWithRelations = Prisma.SchoolGetPayload<{
  include: {
    faculty: true
    career: true
  }
}>

// Type for creating a School (omit id, version, createdAt, updatedAt, and relations)
export type CreateSchoolInput = Omit<
  Prisma.SchoolCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'faculty' | 'career'
> & {
  faculty?: { connect: { id: string } }
  career?: { connect: { id: string }[] }
  status?: Status
}

// Type for updating a School (partial of create)
export type UpdateSchoolInput = Partial<CreateSchoolInput>
