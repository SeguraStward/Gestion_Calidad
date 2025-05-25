import { Logger } from '@nestjs/common';
import { Prisma, Parameter } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ParametersRepository extends GenericPrismaRepository<
  Parameter,
  Prisma.ParameterCreateInput,
  Prisma.ParameterUpdateInput,
  Prisma.ParameterWhereUniqueInput
> {
  private readonly logger = new Logger(ParametersRepository.name);
  protected readonly modelName = 'parameter';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ParametersRepository initialized');
  }
}
