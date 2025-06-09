import { Logger } from '@nestjs/common';
import { Prisma, Course } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CoursesRepository extends GenericPrismaRepository<
  Course,
  Prisma.CourseCreateInput,
  Prisma.CourseUpdateInput,
  Prisma.CourseWhereUniqueInput
> {
  private readonly logger = new Logger(CoursesRepository.name);
  protected readonly modelName = 'course';
  protected readonly defaultIncludes = { career: true, academicLoads: true };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CoursesRepository initialized');
  }
}
