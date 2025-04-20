import { Logger } from '@nestjs/common';
import { Prisma, Faculty } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaModule } from '@src/prisma/prisma.module';

export class FacultiesRepository extends GenericPrismaRepository<
  Faculty,
  Prisma.FacultyCreateInput,
  Prisma.FacultyUpdateInput,
  Prisma.FacultyWhereUniqueInput
> {
  private readonly logger = new Logger(FacultiesRepository.name);
  protected readonly modelName = 'faculty';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('FacultiesRepository initialized');
  }
}
