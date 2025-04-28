import { Logger } from '@nestjs/common';
import { Prisma, AcademicLoad } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicLoadsRepository extends GenericPrismaRepository<
  AcademicLoad,
  Prisma.AcademicLoadCreateInput,
  Prisma.AcademicLoadUpdateInput,
  Prisma.AcademicLoadWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicLoadsRepository.name);
  protected readonly modelName = 'academicLoad';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('AcademicLoadsRepository initialized');
  }
}
