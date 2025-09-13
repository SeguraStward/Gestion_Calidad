import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProofDocumentsService } from './proof-documents.service';
import { ProofDocumentsController } from './proof-documents.controller';
import { ProofDocumentsRepository } from './proof-documents.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProofDocumentsController],
  providers: [ProofDocumentsService, ProofDocumentsRepository, DtoValidator],
  exports: [ProofDocumentsService, ProofDocumentsRepository],
})
export class ProofDocumentsModule { }
