import { Logger } from '@nestjs/common';
import { Prisma, ProofDocumentType } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProofDocumentTypesRepository extends GenericPrismaRepository<
  ProofDocumentType,
  Prisma.ProofDocumentTypeCreateInput,
  Prisma.ProofDocumentTypeUpdateInput,
  Prisma.ProofDocumentTypeWhereUniqueInput
> {
  private readonly logger = new Logger(ProofDocumentTypesRepository.name);
  protected readonly modelName = 'proofDocumentType';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProofDocumentTypesRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.proofDocumentType.findMany({
        where,
        orderBy: orderBy || { code: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), proofDocuments: true, documentCounter: true },
      }),
      this.prisma.proofDocumentType.count({ where }),
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
    return this.prisma.proofDocumentType.findUnique({
      where: { id },
      include: { ...(include || {}), proofDocuments: true, documentCounter: true },
    });
  }
}
