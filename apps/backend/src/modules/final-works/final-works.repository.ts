import { Logger } from '@nestjs/common';
import { Prisma, FinalWork } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class FinalWorksRepository extends GenericPrismaRepository<
  FinalWork,
  Prisma.FinalWorkCreateInput,
  Prisma.FinalWorkUpdateInput,
  Prisma.FinalWorkWhereUniqueInput
> {
  private readonly logger = new Logger(FinalWorksRepository.name);
  protected readonly modelName = 'finalWork';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('FinalWorksRepository initialized');
  }
}
