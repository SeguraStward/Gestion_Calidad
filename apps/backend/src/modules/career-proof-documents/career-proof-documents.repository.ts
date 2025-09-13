import { Logger } from '@nestjs/common';
import { Prisma, CareerProofDocument } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class CareerProofDocumentsRepository extends GenericPrismaRepository<
  CareerProofDocument,
  Prisma.CareerProofDocumentCreateInput,
  Prisma.CareerProofDocumentUpdateInput,
  Prisma.CareerProofDocumentWhereUniqueInput
> {
  private readonly logger = new Logger(CareerProofDocumentsRepository.name);
  protected readonly modelName = 'careerProofDocument';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('CareerProofDocumentsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.careerProofDocument.findMany({
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: {
          ...(include || {}),
          career: true,
          proofDocument: true
        },
      }),
      this.prisma.careerProofDocument.count({ where }),
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
    return this.prisma.careerProofDocument.findUnique({
      where: { id },
      include: {
        ...(include || {}),
        career: true,
        proofDocument: true
      },
    });
  }
}
