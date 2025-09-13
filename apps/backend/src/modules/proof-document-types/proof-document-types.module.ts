import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProofDocumentTypesService } from './proof-document-types.service';
import { ProofDocumentTypesController } from './proof-document-types.controller';
import { ProofDocumentTypesRepository } from './proof-document-types.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProofDocumentTypesController],
  providers: [ProofDocumentTypesService, ProofDocumentTypesRepository, DtoValidator],
  exports: [ProofDocumentTypesService, ProofDocumentTypesRepository],
})
export class ProofDocumentTypesModule { }
