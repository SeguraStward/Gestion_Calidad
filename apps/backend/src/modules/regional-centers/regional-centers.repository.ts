import { Logger } from '@nestjs/common';
import { Prisma, RegionalCenter } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class RegionalCentersRepository extends GenericPrismaRepository<
  RegionalCenter,
  Prisma.RegionalCenterCreateInput,
  Prisma.RegionalCenterUpdateInput,
  Prisma.RegionalCenterWhereUniqueInput
> {
  private readonly logger = new Logger(RegionalCentersRepository.name);
  protected readonly modelName = 'regionalCenter';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('RegionalCentersRepository initialized');
  }
}
