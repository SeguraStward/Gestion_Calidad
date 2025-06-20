import { Logger } from '@nestjs/common';
import { Prisma, AcademicCycle } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicCyclesRepository extends GenericPrismaRepository<
  AcademicCycle,
  Prisma.AcademicCycleCreateInput,
  Prisma.AcademicCycleUpdateInput,
  Prisma.AcademicCycleWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicCyclesRepository.name);
  protected readonly modelName = 'academicCycle';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('AcademicCyclesRepository initialized');
  }
}
