import { Logger } from '@nestjs/common';
import { Prisma, CommSession } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CommSessionsRepository extends GenericPrismaRepository<
  CommSession,
  Prisma.CommSessionCreateInput,
  Prisma.CommSessionUpdateInput,
  Prisma.CommSessionWhereUniqueInput
> {
  private readonly logger = new Logger(CommSessionsRepository.name);
  protected readonly modelName = 'commSession';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CommSessionsRepository initialized');
  }
}
