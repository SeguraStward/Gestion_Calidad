import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicLoadsService } from './academic-loads.service';
import { AcademicLoadsController } from './academic-loads.controller';
import { AcademicLoadsRepository } from './academic-loads.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicLoadsController],
  providers: [AcademicLoadsService, AcademicLoadsRepository, DtoValidator],
  exports: [AcademicLoadsService, AcademicLoadsRepository],
})
export class AcademicLoadsModule {}
