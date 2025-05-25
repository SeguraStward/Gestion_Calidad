import { Logger } from '@nestjs/common';
import { Prisma, ProjectLog } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProjectLogsRepository extends GenericPrismaRepository<
  ProjectLog,
  Prisma.ProjectLogCreateInput,
  Prisma.ProjectLogUpdateInput,
  Prisma.ProjectLogWhereUniqueInput
> {
  private readonly logger = new Logger(ProjectLogsRepository.name);
  protected readonly modelName = 'projectLog';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProjectLogsRepository initialized');
  }
}
