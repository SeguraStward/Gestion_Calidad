import { Logger } from '@nestjs/common';
import { Prisma, Document } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class DocumentsRepository extends GenericPrismaRepository<
  Document,
  Prisma.DocumentCreateInput,
  Prisma.DocumentUpdateInput,
  Prisma.DocumentWhereUniqueInput
> {
  private readonly logger = new Logger(DocumentsRepository.name);
  protected readonly modelName = 'document';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('DocumentsRepository initialized');
  }
}
