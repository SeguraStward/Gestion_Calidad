import { Logger } from '@nestjs/common';
import { Prisma, FinalReport } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class FinalReportsRepository extends GenericPrismaRepository<
  FinalReport,
  Prisma.FinalReportCreateInput,
  Prisma.FinalReportUpdateInput,
  Prisma.FinalReportWhereUniqueInput
> {
  private readonly logger = new Logger(FinalReportsRepository.name);
  protected readonly modelName = 'finalReport';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('FinalReportsRepository initialized');
  }
}
