import { Logger } from '@nestjs/common';
import { Prisma, StandardEvidence } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class StandardEvidencesRepository extends GenericPrismaRepository<
  StandardEvidence,
  Prisma.StandardEvidenceCreateInput,
  Prisma.StandardEvidenceUpdateInput,
  Prisma.StandardEvidenceWhereUniqueInput
> {
  private readonly logger = new Logger(StandardEvidencesRepository.name);
  protected readonly modelName = 'standardEvidence';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('StandardEvidencesRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.standardEvidence.findMany({
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: {
          ...(include || {}),
          standard: true,
          evidence: true
        },
      }),
      this.prisma.standardEvidence.count({ where }),
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
    return this.prisma.standardEvidence.findUnique({
      where: { id },
      include: {
        ...(include || {}),
        standard: true,
        evidence: true
      },
    });
  }
}
