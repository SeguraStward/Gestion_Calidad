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
    // Si se proporciona un include personalizado, usarlo completamente
    // De lo contrario, usar el include por defecto (components: true)
    const effectiveInclude = include || { components: true };

    const [data, total] = await Promise.all([
      this.prisma.dimension.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: effectiveInclude,
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
    const effectiveInclude = include || { components: true };
    return this.prisma.dimension.findUnique({
      where: { id },
      include: effectiveInclude,
    });
  }

  async findByName(name: string): Promise<Dimension | null> {
    return this.prisma.dimension.findFirst({
      where: { name },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const dimension = await this.prisma.dimension.findFirst({
      where: {
        name,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!dimension;
  }
}
