import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { DimensionsService } from './dimensions.service';
import { DimensionsController } from './dimensions.controller';
import { DimensionsRepository } from './dimensions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DimensionsController],
  providers: [DimensionsService, DimensionsRepository, DtoValidator],
  exports: [DimensionsService, DimensionsRepository],
})
export class DimensionsModule { }
