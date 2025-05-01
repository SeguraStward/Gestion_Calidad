import { Logger } from '@nestjs/common';

import { Prisma, AcademicBackground } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicBackgroundsRepository extends GenericPrismaRepository<
  AcademicBackground,
  Prisma.AcademicBackgroundCreateInput,
  Prisma.AcademicBackgroundUpdateInput,
  Prisma.AcademicBackgroundWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicBackgroundsRepository.name);

  protected readonly modelName = 'academicBackground';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('AcademicBackgroundsRepository initialized');
  }
}
