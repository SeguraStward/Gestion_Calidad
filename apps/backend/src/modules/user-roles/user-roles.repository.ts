import { Logger } from '@nestjs/common';
import { Prisma, UserRole } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class UserRolesRepository extends GenericPrismaRepository<
  UserRole,
  Prisma.UserRoleCreateInput,
  Prisma.UserRoleUpdateInput,
  Prisma.UserRoleWhereUniqueInput
> {
  private readonly logger = new Logger(UserRolesRepository.name);
  protected readonly modelName = 'userRole';
  protected readonly defaultIncludes = { name: true, permissions: true, users: true, id: true };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UserRolesRepository initialized');
  }
}
