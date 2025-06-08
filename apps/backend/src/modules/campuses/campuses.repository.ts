import { Logger } from '@nestjs/common';
import { Prisma, Campus } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CampusesRepository extends GenericPrismaRepository<
  Campus,
  Prisma.CampusCreateInput,
  Prisma.CampusUpdateInput,
  Prisma.CampusWhereUniqueInput
> {
  private readonly logger = new Logger(CampusesRepository.name);
  protected readonly modelName = 'campus';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CampusesRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.campus.findMany({
        where,
        orderBy,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), regionalCenter: true },
      }),
      this.prisma.campus.count({ where }),
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
    return this.prisma.campus.findUnique({
      where: { id },
      include: { ...(include || {}), regionalCenter: true },
    });
  }
}
