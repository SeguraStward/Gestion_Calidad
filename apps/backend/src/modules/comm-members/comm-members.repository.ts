import { Logger } from '@nestjs/common';
import { Prisma, CommMember } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CommMembersRepository extends GenericPrismaRepository<
  CommMember,
  Prisma.CommMemberCreateInput,
  Prisma.CommMemberUpdateInput,
  Prisma.CommMemberWhereUniqueInput
> {
  private readonly logger = new Logger(CommMembersRepository.name);
  protected readonly modelName = 'commMember';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CommMembersRepository initialized');
  }
}
