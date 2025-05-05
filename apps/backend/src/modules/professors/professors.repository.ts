import { Logger } from '@nestjs/common';
import { Prisma, Professor } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProfessorsRepository extends GenericPrismaRepository<
  Professor,
  Prisma.ProfessorCreateInput,
  Prisma.ProfessorUpdateInput,
  Prisma.ProfessorWhereUniqueInput
> {
  private readonly logger = new Logger(ProfessorsRepository.name);
  protected readonly modelName = 'professor';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProfessorsRepository initialized');
  }
}
