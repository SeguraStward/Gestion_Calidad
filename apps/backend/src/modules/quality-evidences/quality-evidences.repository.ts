import { Logger } from '@nestjs/common';
import { Prisma, QualityEvidence } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class QualityEvidencesRepository extends GenericPrismaRepository<
  QualityEvidence,
  Prisma.QualityEvidenceCreateInput,
  Prisma.QualityEvidenceUpdateInput,
  Prisma.QualityEvidenceWhereUniqueInput
> {
  private readonly logger = new Logger(QualityEvidencesRepository.name);
  protected readonly modelName = 'qualityEvidence';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('QualityEvidencesRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.qualityEvidence.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), standard: true, criterion: true, proofDocuments: true, standardEvidences: true },
      }),
      this.prisma.qualityEvidence.count({ where }),
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
    return this.prisma.qualityEvidence.findUnique({
      where: { id },
      include: { ...(include || {}), standard: true, criterion: true, proofDocuments: true, standardEvidences: true },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const evidence = await this.prisma.qualityEvidence.findFirst({
      where: {
        name,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!evidence;
  }
}
