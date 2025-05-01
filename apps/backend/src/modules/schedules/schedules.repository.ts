import { Logger } from '@nestjs/common';

import { Prisma, Schedule } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class SchedulesRepository extends GenericPrismaRepository<
  Schedule,
  Prisma.ScheduleCreateInput,
  Prisma.ScheduleUpdateInput,
  Prisma.ScheduleWhereUniqueInput
> {
  private readonly logger = new Logger(SchedulesRepository.name);

  protected readonly modelName = 'schedule';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('SchedulesRepository initialized');
  }
}
