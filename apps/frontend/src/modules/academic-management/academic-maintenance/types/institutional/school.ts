import { Prisma, Status } from '@una-gc/database/prisma/generated/client'

export type SchoolWithRelations = Prisma.SchoolGetPayload<{
  include: {
    faculty: true
    courses: true
    career: true
  }
}> & { id?: string; _id?: string } // Ensure id/_id can be present

export type CreateSchoolInput = Omit<
  Prisma.SchoolCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' // Assuming createdBy/updatedBy are handled by backend
> & {
  faculty?: { connect: { id: string } }
  courses?: { connect?: { id: string }[] } // Optional connect for flexibility
  career?: { connect?: { id: string }[] } // Optional connect for flexibility
  status?: Status // Added status field
}
