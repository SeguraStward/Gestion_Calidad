import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CareerProofDocumentsService } from './career-proof-documents.service';
import { CareerProofDocumentsController } from './career-proof-documents.controller';
import { CareerProofDocumentsRepository } from './career-proof-documents.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CareerProofDocumentsController],
  providers: [CareerProofDocumentsService, CareerProofDocumentsRepository, DtoValidator],
  exports: [CareerProofDocumentsService, CareerProofDocumentsRepository],
})
export class CareerProofDocumentsModule { }
