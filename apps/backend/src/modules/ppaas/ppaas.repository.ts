import { Logger } from '@nestjs/common';

import { Prisma, Ppaa } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class PpaasRepository extends GenericPrismaRepository<
  Ppaa,
  Prisma.PpaaCreateInput,
  Prisma.PpaaUpdateInput,
  Prisma.PpaaWhereUniqueInput
> {
  private readonly logger = new Logger(PpaasRepository.name);

  protected readonly modelName = 'ppaa';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('PpaasRepository initialized');
  }
}
