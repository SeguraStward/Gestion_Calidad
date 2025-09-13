import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { QualityEvidencesService } from './quality-evidences.service';
import { QualityEvidencesController } from './quality-evidences.controller';
import { QualityEvidencesRepository } from './quality-evidences.repository';

@Module({
  imports: [PrismaModule],
  controllers: [QualityEvidencesController],
  providers: [QualityEvidencesService, QualityEvidencesRepository, DtoValidator],
  exports: [QualityEvidencesService, QualityEvidencesRepository],
})
export class QualityEvidencesModule { }
