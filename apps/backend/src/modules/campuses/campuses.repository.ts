import { Logger } from '@nestjs/common';
import { Prisma, Campus } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CampusesRepository extends GenericPrismaRepository<
  Campus,
  Prisma.CampusCreateInput,
  Prisma.CampusUpdateInput,
  Prisma.CampusWhereUniqueInput
> {
  private readonly logger = new Logger(CampusesRepository.name);
  protected readonly modelName = 'campus';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CampusesRepository initialized');
  }
}
