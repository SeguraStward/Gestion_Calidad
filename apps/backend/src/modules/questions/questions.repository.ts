import { Logger } from '@nestjs/common';
import { Prisma, Question } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class QuestionsRepository extends GenericPrismaRepository<
  Question,
  Prisma.QuestionCreateInput,
  Prisma.QuestionUpdateInput,
  Prisma.QuestionWhereUniqueInput
> {
  private readonly logger = new Logger(QuestionsRepository.name);
  protected readonly modelName = 'question';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('QuestionsRepository initialized');
  }
}
