import { Logger } from '@nestjs/common';
import { Prisma, Standard } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class StandardsRepository extends GenericPrismaRepository<
  Standard,
  Prisma.StandardCreateInput,
  Prisma.StandardUpdateInput,
  Prisma.StandardWhereUniqueInput
> {
  private readonly logger = new Logger(StandardsRepository.name);
  protected readonly modelName = 'standard';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('StandardsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.standard.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), criterion: true, evidences: true, standardEvidences: true },
      }),
      this.prisma.standard.count({ where }),
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
    return this.prisma.standard.findUnique({
      where: { id },
      include: { ...(include || {}), criterion: true, evidences: true, standardEvidences: true },
    });
  }
}
