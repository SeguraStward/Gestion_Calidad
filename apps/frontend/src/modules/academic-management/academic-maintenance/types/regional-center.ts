import { Prisma, Status } from '@una-gc/database/prisma/generated/client'

// Define the base type for RegionalCenter with relations
export type RegionalCenterWithRelations = Prisma.RegionalCenterGetPayload<{
  include: {
    campuses: true
    commissions: true
    projects: true
  }
}>

// Type for creating a RegionalCenter
export type CreateRegionalCenterInput = Omit<
  Prisma.RegionalCenterCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'campuses'
> & {
  status: Status
}

// Type for updating a RegionalCenter
export type UpdateRegionalCenterInput = Partial<CreateRegionalCenterInput>

// Type for campus selection in forms
export interface CampusSelectOption {
  id: string
  name: string
  code?: string
  status: Status
}

export interface RegionalCenterFilters {
  search?: string
  status?: Status
  limit?: number // Permite paginación o traer todos para selects
}

// Type for regional center selection in forms
export interface RegionalCenterSelectOption {
  id: string
  name: string
  code: string
  status: Status
}
