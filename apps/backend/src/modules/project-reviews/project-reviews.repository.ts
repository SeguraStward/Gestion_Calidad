import { Logger } from '@nestjs/common';
import { Prisma, ProjectReview } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProjectReviewsRepository extends GenericPrismaRepository<
  ProjectReview,
  Prisma.ProjectReviewCreateInput,
  Prisma.ProjectReviewUpdateInput,
  Prisma.ProjectReviewWhereUniqueInput
> {
  private readonly logger = new Logger(ProjectReviewsRepository.name);
  protected readonly modelName = 'projectReview';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProjectReviewsRepository initialized');
  }
}
