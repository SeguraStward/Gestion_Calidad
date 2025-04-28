import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicPeriodsService } from './academic-periods.service';
import { AcademicPeriodsController } from './academic-periods.controller';
import { AcademicPeriodsRepository } from './academic-periods.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicPeriodsController],
  providers: [AcademicPeriodsService, AcademicPeriodsRepository, DtoValidator],
  exports: [AcademicPeriodsService, AcademicPeriodsRepository],
})
export class AcademicPeriodsModule {}
