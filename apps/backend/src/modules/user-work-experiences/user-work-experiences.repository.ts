import { Logger } from '@nestjs/common';
import { Prisma, UserWorkExperience } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class UserWorkExperiencesRepository extends GenericPrismaRepository<
  UserWorkExperience,
  Prisma.UserWorkExperienceCreateInput,
  Prisma.UserWorkExperienceUpdateInput,
  Prisma.UserWorkExperienceWhereUniqueInput
> {
  private readonly logger = new Logger(UserWorkExperiencesRepository.name);
  protected readonly modelName = 'userWorkExperience';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UserWorkExperiencesRepository initialized');
  }
}
