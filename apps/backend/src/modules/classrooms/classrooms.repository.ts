import { Logger } from '@nestjs/common';
import { Prisma, Classroom } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ClassroomsRepository extends GenericPrismaRepository<
  Classroom,
  Prisma.ClassroomCreateInput,
  Prisma.ClassroomUpdateInput,
  Prisma.ClassroomWhereUniqueInput
> {
  private readonly logger = new Logger(ClassroomsRepository.name);
  protected readonly modelName = 'classroom';
  // Always include campus relation by default
  protected readonly defaultIncludes = { campus: true };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ClassroomsRepository initialized');
  }
}
