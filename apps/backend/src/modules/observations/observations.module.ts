import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';
import { ObservationsRepository } from './observations.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ObservationsController],
  providers: [ObservationsService, ObservationsRepository, DtoValidator],
  exports: [ObservationsService, ObservationsRepository],
})
export class ObservationsModule {}
