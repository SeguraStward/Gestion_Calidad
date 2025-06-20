import { Logger } from '@nestjs/common';
import { Prisma, Observation } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ObservationsRepository extends GenericPrismaRepository<
  Observation,
  Prisma.ObservationCreateInput,
  Prisma.ObservationUpdateInput,
  Prisma.ObservationWhereUniqueInput
> {
  private readonly logger = new Logger(ObservationsRepository.name);
  protected readonly modelName = 'observation';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ObservationsRepository initialized');
  }
}
