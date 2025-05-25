import { Logger } from '@nestjs/common';
import { Prisma, Commission } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CommissionsRepository extends GenericPrismaRepository<
  Commission,
  Prisma.CommissionCreateInput,
  Prisma.CommissionUpdateInput,
  Prisma.CommissionWhereUniqueInput
> {
  private readonly logger = new Logger(CommissionsRepository.name);
  protected readonly modelName = 'commission';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CommissionsRepository initialized');
  }
}
