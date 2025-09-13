import { Logger } from '@nestjs/common';
import { Prisma, ProofDocument } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ProofDocumentsRepository extends GenericPrismaRepository<
  ProofDocument,
  Prisma.ProofDocumentCreateInput,
  Prisma.ProofDocumentUpdateInput,
  Prisma.ProofDocumentWhereUniqueInput
> {
  private readonly logger = new Logger(ProofDocumentsRepository.name);
  protected readonly modelName = 'proofDocument';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ProofDocumentsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.proofDocument.findMany({
        where,
        orderBy: orderBy || { code: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: {
          ...(include || {}),
          evidence: true,
          proofDocumentType: true,
          careerProofDocuments: true
        },
      }),
      this.prisma.proofDocument.count({ where }),
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
    return this.prisma.proofDocument.findUnique({
      where: { id },
      include: {
        ...(include || {}),
        evidence: true,
        proofDocumentType: true,
        careerProofDocuments: true
      },
    });
  }

  // Método específico para generar el siguiente código de documento
  async generateNextCode(proofDocumentTypeId: string): Promise<string> {
    // Obtener el tipo de documento para obtener el prefijo
    const documentType = await this.prisma.proofDocumentType.findUnique({
      where: { id: proofDocumentTypeId },
      include: { documentCounter: true }
    });

    if (!documentType) {
      throw new Error('Proof document type not found');
    }

    // Incrementar el contador o crear uno nuevo
    const counter = await this.prisma.documentCounter.upsert({
      where: { proofDocumentTypeId },
      update: { lastNumber: { increment: 1 } },
      create: { proofDocumentTypeId, lastNumber: 1 }
    });

    // Generar el código con formato: PREFIX-NUMBER (ej: CONV-001)
    const formattedNumber = counter.lastNumber.toString().padStart(3, '0');
    return `${documentType.prefix}-${formattedNumber}`;
  }
}
