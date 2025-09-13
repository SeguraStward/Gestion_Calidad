import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';
import { CriteriaRepository } from './criteria.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CriteriaController],
  providers: [CriteriaService, CriteriaRepository, DtoValidator],
  exports: [CriteriaService, CriteriaRepository],
})
export class CriteriaModule { }
