import { Logger } from '@nestjs/common';
import { Prisma, User } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaModule } from '@src/prisma/prisma.module';

export class UsersRepository extends GenericPrismaRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput
> {
  private readonly logger = new Logger(UsersRepository.name);
  protected readonly modelName = 'user';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UsersRepository initialized');
  }
}
