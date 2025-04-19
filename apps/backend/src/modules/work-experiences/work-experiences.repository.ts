import { Logger } from '@nestjs/common';
import { Prisma, WorkExperience } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class WorkExperiencesRepository extends GenericPrismaRepository<
  WorkExperience,
  Prisma.WorkExperienceCreateInput,
  Prisma.WorkExperienceUpdateInput,
  Prisma.WorkExperienceWhereUniqueInput
> {
  private readonly logger = new Logger(WorkExperiencesRepository.name);
  protected readonly modelName = 'workExperience';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('WorkExperiencesRepository initialized');
  }
}
