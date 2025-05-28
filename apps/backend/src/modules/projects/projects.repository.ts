import { Logger } from '@nestjs/common';
import { Prisma, Project } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProjectsRepository extends GenericPrismaRepository<
  Project,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput,
  Prisma.ProjectWhereUniqueInput
> {
  private readonly logger = new Logger(ProjectsRepository.name);
  protected readonly modelName = 'project';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProjectsRepository initialized');
  }
}
