import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProofDocumentsService } from './proof-documents.service';
import { ProofDocumentsController } from './proof-documents.controller';
import { ProofDocumentsRepository } from './proof-documents.repository';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { QualityEvidencesModule } from '../quality-evidences/quality-evidences.module';
import { CareersModule } from '../careers/careers.module';
import { SinaesDocumentHistoryModule } from '../sinaes-document-history/sinaes-document-history.module';

@Module({
  imports: [
    PrismaModule,
    GoogleDriveModule,
    QualityEvidencesModule,
    CareersModule,
    SinaesDocumentHistoryModule,
  ],
  controllers: [ProofDocumentsController],
  providers: [ProofDocumentsService, ProofDocumentsRepository, DtoValidator],
  exports: [ProofDocumentsService, ProofDocumentsRepository],
})
export class ProofDocumentsModule { }
