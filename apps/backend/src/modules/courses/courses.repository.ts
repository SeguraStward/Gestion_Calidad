import { Logger } from '@nestjs/common';
import { Prisma, Course } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaModule } from '@src/prisma/prisma.module';

export class CoursesRepository extends GenericPrismaRepository<
  Course,
  Prisma.CourseCreateInput,
  Prisma.CourseUpdateInput,
  Prisma.CourseWhereUniqueInput
> {
  private readonly logger = new Logger(CoursesRepository.name);
  protected readonly modelName = 'course';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CoursesRepository initialized');
  }
}
