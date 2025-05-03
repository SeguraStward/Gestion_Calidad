import { Logger } from '@nestjs/common';

import { Prisma, School } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class SchoolsRepository extends GenericPrismaRepository<
  School,
  Prisma.SchoolCreateInput,
  Prisma.SchoolUpdateInput,
  Prisma.SchoolWhereUniqueInput
> {
  private readonly logger = new Logger(SchoolsRepository.name);

  protected readonly modelName = 'school';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('SchoolsRepository initialized');
  }
}
