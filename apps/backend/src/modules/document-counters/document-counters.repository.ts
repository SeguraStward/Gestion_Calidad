import { Logger } from '@nestjs/common';
import { Prisma, DocumentCounter } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class DocumentCountersRepository extends GenericPrismaRepository<
  DocumentCounter,
  Prisma.DocumentCounterCreateInput,
  Prisma.DocumentCounterUpdateInput,
  Prisma.DocumentCounterWhereUniqueInput
> {
  private readonly logger = new Logger(DocumentCountersRepository.name);
  protected readonly modelName = 'documentCounter';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('DocumentCountersRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.documentCounter.findMany({
        where,
        orderBy: orderBy || { lastNumber: 'desc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), proofDocumentType: true },
      }),
      this.prisma.documentCounter.count({ where }),
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
    return this.prisma.documentCounter.findUnique({
      where: { id },
      include: { ...(include || {}), proofDocumentType: true },
    });
  }
}
