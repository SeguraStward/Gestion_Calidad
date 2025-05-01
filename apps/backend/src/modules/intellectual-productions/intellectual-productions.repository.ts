import { Logger } from '@nestjs/common';

import { Prisma, IntellectualProduction } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class IntellectualProductionsRepository extends GenericPrismaRepository<
  IntellectualProduction,
  Prisma.IntellectualProductionCreateInput,
  Prisma.IntellectualProductionUpdateInput,
  Prisma.IntellectualProductionWhereUniqueInput
> {
  private readonly logger = new Logger(IntellectualProductionsRepository.name);

  protected readonly modelName = 'intellectualProduction';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('IntellectualProductionsRepository initialized');
  }
}
