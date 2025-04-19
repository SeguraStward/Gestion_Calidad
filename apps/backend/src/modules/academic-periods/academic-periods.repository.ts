import { Logger } from '@nestjs/common';
import { Prisma, AcademicPeriod } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicPeriodsRepository extends GenericPrismaRepository<
  AcademicPeriod,
  Prisma.AcademicPeriodCreateInput,
  Prisma.AcademicPeriodUpdateInput,
  Prisma.AcademicPeriodWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicPeriodsRepository.name);
  protected readonly modelName = 'academicPeriod';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('AcademicPeriodsRepository initialized');
  }
}
