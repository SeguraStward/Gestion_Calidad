import { Logger } from '@nestjs/common';
import { Prisma, Criterion } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CriteriaRepository extends GenericPrismaRepository<
  Criterion,
  Prisma.CriterionCreateInput,
  Prisma.CriterionUpdateInput,
  Prisma.CriterionWhereUniqueInput
> {
  private readonly logger = new Logger(CriteriaRepository.name);
  protected readonly modelName = 'criterion';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CriteriaRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.criterion.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), component: true, standards: true, evidences: true },
      }),
      this.prisma.criterion.count({ where }),
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
    return this.prisma.criterion.findUnique({
      where: { id },
      include: { ...(include || {}), component: true, standards: true, evidences: true },
    });
  }
}
