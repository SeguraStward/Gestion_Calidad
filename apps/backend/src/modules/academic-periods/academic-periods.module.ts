import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicPeriodsService } from './academic-periods.service';
import { AcademicPeriodsController } from './academic-periods.controller';
import { AcademicPeriodsRepository } from './academic-periods.repository';

@Module({
  controllers: [AcademicPeriodsController],
  providers: [PrismaService, AcademicPeriodsService, AcademicPeriodsRepository, DtoValidator],
  exports: [AcademicPeriodsService, AcademicPeriodsRepository],
})
export class AcademicPeriodsModule {}
