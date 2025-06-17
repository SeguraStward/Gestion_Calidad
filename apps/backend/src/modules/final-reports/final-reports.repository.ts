import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { FinalReport, Prisma } from '@una-gc/database/prisma/generated/client'; // Ensure this path is correct

@Injectable()
export class FinalReportsRepository extends GenericPrismaRepository<
  FinalReport,
  Prisma.FinalReportCreateInput,
  Prisma.FinalReportUpdateInput,
  Prisma.FinalReportWhereUniqueInput
> {
  protected readonly logger = new Logger(FinalReportsRepository.name);
  // Changed type from keyof PrismaService to string
  protected readonly modelName: string = 'finalReport';

  protected readonly defaultIncludes: Prisma.FinalReportInclude = undefined;

  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
    this.logger.debug('FinalReportsRepository initialized');
  }

  // Specific repository methods can still be defined here if needed.
  async findPendingWithEndedCycle(today: Date): Promise<FinalReport[]> {
    return this.prismaService.finalReport.findMany({
      where: {
        status: 'PENDING',
        academicLoad: {
          academicCycle: {
            endDate: {
              not: null,
              lt: today,
            },
          },
        },
      },
      include: {
        academicLoad: {
          include: {
            academicCycle: true,
          },
        },
      },
    });
  }
}
