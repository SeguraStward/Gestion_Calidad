import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Cohort, Prisma } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class CohortsRepository extends GenericPrismaRepository<
  Cohort,
  Prisma.CohortCreateInput,
  Prisma.CohortUpdateInput,
  Prisma.CohortWhereUniqueInput
> {
  protected readonly modelName = 'cohort' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByCareer(careerId: string) {
    return this.prismaService.cohort.findMany({
      where: { careerId },
      orderBy: [{ year: 'desc' }, { group: 'asc' }],
    });
  }

  async findAllWithCareer() {
    return this.prismaService.cohort.findMany({
      orderBy: [{ year: 'desc' }, { group: 'asc' }],
    });
  }
}
