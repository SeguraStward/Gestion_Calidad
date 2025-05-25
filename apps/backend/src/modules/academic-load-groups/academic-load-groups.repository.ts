import { Logger } from '@nestjs/common';
import { Prisma, AcademicLoadGroup } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class AcademicLoadGroupsRepository extends GenericPrismaRepository<
  AcademicLoadGroup,
  Prisma.AcademicLoadGroupCreateInput,
  Prisma.AcademicLoadGroupUpdateInput,
  Prisma.AcademicLoadGroupWhereUniqueInput
> {
  private readonly logger = new Logger(AcademicLoadGroupsRepository.name);
  protected readonly modelName = 'academicLoadGroup';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('AcademicLoadGroupsRepository initialized');
  }
}
