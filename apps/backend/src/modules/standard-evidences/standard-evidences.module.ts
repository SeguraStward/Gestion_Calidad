import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { StandardEvidencesService } from './standard-evidences.service';
import { StandardEvidencesController } from './standard-evidences.controller';
import { StandardEvidencesRepository } from './standard-evidences.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StandardEvidencesController],
  providers: [StandardEvidencesService, StandardEvidencesRepository, DtoValidator],
  exports: [StandardEvidencesService, StandardEvidencesRepository],
})
export class StandardEvidencesModule { }
