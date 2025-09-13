import { Logger } from '@nestjs/common';
import { Prisma, Dimension } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class DimensionsRepository extends GenericPrismaRepository<
  Dimension,
  Prisma.DimensionCreateInput,
  Prisma.DimensionUpdateInput,
  Prisma.DimensionWhereUniqueInput
> {
  private readonly logger = new Logger(DimensionsRepository.name);
  protected readonly modelName = 'dimension';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('DimensionsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.dimension.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), components: true },
      }),
      this.prisma.dimension.count({ where }),
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
    return this.prisma.dimension.findUnique({
      where: { id },
      include: { ...(include || {}), components: true },
    });
  }
}
