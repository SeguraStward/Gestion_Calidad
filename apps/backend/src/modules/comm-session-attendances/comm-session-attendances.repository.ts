import { Logger } from '@nestjs/common';
import { Prisma, CommSessionAttendance } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CommSessionAttendancesRepository extends GenericPrismaRepository<
  CommSessionAttendance,
  Prisma.CommSessionAttendanceCreateInput,
  Prisma.CommSessionAttendanceUpdateInput,
  Prisma.CommSessionAttendanceWhereUniqueInput
> {
  private readonly logger = new Logger(CommSessionAttendancesRepository.name);
  protected readonly modelName = 'commSessionAttendance';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CommSessionAttendancesRepository initialized');
  }
}
