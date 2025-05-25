import { Logger } from '@nestjs/common';
import { Prisma, QuestionGroup } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class QuestionGroupsRepository extends GenericPrismaRepository<
  QuestionGroup,
  Prisma.QuestionGroupCreateInput,
  Prisma.QuestionGroupUpdateInput,
  Prisma.QuestionGroupWhereUniqueInput
> {
  private readonly logger = new Logger(QuestionGroupsRepository.name);
  protected readonly modelName = 'questionGroup';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('QuestionGroupsRepository initialized');
  }
}
