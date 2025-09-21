import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, CampusJourneyTimeAllocation } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class CampusJourneyTimeAllocationsRepository extends GenericPrismaRepository<
  CampusJourneyTimeAllocation,
  Prisma.CampusJourneyTimeAllocationCreateInput,
  Prisma.CampusJourneyTimeAllocationUpdateInput,
  Prisma.CampusJourneyTimeAllocationWhereUniqueInput
> {
  protected readonly modelName = 'campusJourneyTimeAllocation' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
