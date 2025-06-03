import { Prisma } from "@una-gc/database/prisma/generated/client";

export type RegionalCenterWithRelations = Prisma.RegionalCenterGetPayload<{
  include: {
    campuses: true;
    projects: true;
    commissions: true;
  };
}>;

export type CreateRegionalCenterInput = Omit<
  Prisma.RegionalCenterCreateInput,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'campuses' | 'projects' | 'commissions'
>;

