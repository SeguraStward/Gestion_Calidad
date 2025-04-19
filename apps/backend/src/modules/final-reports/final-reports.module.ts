import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { FinalReportsService } from './final-reports.service';
import { FinalReportsController } from './final-reports.controller';
import { FinalReportsRepository } from './final-reports.repository';

@Module({
  controllers: [FinalReportsController],
  providers: [PrismaService, FinalReportsService, FinalReportsRepository, DtoValidator],
  exports: [FinalReportsService, FinalReportsRepository],
})
export class FinalReportsModule {}
