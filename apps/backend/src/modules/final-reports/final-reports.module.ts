import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { FinalReportsService } from './final-reports.service';
import { FinalReportsController } from './final-reports.controller';
import { FinalReportsRepository } from './final-reports.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FinalReportsController],
  providers: [FinalReportsService, FinalReportsRepository, DtoValidator],
  exports: [FinalReportsService, FinalReportsRepository],
})
export class FinalReportsModule {}
