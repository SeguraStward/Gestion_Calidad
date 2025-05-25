import { Logger } from '@nestjs/common';
import { Prisma, Career } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CareersRepository extends GenericPrismaRepository<
  Career,
  Prisma.CareerCreateInput,
  Prisma.CareerUpdateInput,
  Prisma.CareerWhereUniqueInput
> {
  private readonly logger = new Logger(CareersRepository.name);
  protected readonly modelName = 'career';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CareersRepository initialized');
  }
}
