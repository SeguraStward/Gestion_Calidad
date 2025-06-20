import { Logger } from '@nestjs/common';
import { Prisma, UserPermission } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class UserPermissionsRepository extends GenericPrismaRepository<
  UserPermission,
  Prisma.UserPermissionCreateInput,
  Prisma.UserPermissionUpdateInput,
  Prisma.UserPermissionWhereUniqueInput
> {
  private readonly logger = new Logger(UserPermissionsRepository.name);
  protected readonly modelName = 'userPermission';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UserPermissionsRepository initialized');
  }
}
