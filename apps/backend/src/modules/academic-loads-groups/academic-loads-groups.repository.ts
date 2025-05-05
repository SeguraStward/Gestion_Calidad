import { Logger } from '@nestjs/common';

import { Prisma, AcademicLoadsGroup } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicLoadsGroupsRepository extends GenericPrismaRepository<
  AcademicLoadsGroup,
  Prisma.AcademicLoadsGroupCreateInput,
  Prisma.AcademicLoadsGroupUpdateInput,
  Prisma.AcademicLoadsGroupWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicLoadsGroupsRepository.name);

  protected readonly modelName = 'academicLoadsGroup';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('AcademicLoadsGroupsRepository initialized');
  }
}
