import { Logger } from '@nestjs/common';

import { Prisma, UserLanguage } from '@una-gc/database/prisma/generated/client';

import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';

import { PrismaService } from '@src/prisma/prisma.service';

export class UserLanguagesRepository extends GenericPrismaRepository<
  UserLanguage,
  Prisma.UserLanguageCreateInput,
  Prisma.UserLanguageUpdateInput,
  Prisma.UserLanguageWhereUniqueInput
> {
  private readonly logger = new Logger(UserLanguagesRepository.name);

  protected readonly modelName = 'userLanguage';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);

    this.logger.debug('UserLanguagesRepository initialized');
  }
}
