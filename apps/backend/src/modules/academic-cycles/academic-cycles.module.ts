import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicCyclesService } from './academic-cycles.service';
import { AcademicCyclesController } from './academic-cycles.controller';
import { AcademicCyclesRepository } from './academic-cycles.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicCyclesController],
  providers: [AcademicCyclesService, AcademicCyclesRepository, DtoValidator],
  exports: [AcademicCyclesService, AcademicCyclesRepository],
})
export class AcademicCyclesModule {}
