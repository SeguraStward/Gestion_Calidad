import { Logger } from '@nestjs/common';
import { Prisma, RegionalCenter } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class RegionalCentersRepository extends GenericPrismaRepository<
  RegionalCenter,
  Prisma.RegionalCenterCreateInput,
  Prisma.RegionalCenterUpdateInput,
  Prisma.RegionalCenterWhereUniqueInput
> {
  private readonly logger = new Logger(RegionalCentersRepository.name);
  protected readonly modelName = 'regionalCenter';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('RegionalCentersRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.regionalCenter.findMany({
        where,
        orderBy,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), campuses: true, commissions: true, projects: true },
      }),
      this.prisma.regionalCenter.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? total,
        pageCount: limit ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findById(id: string, include?: Record<string, any>) {
    return this.prisma.regionalCenter.findUnique({
      where: { id },
      include: { ...(include || {}), campuses: true },
    });
  }
}
