import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesRepository } from './schedules.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesRepository, DtoValidator],
  exports: [SchedulesService, SchedulesRepository],
})
export class SchedulesModule {}
