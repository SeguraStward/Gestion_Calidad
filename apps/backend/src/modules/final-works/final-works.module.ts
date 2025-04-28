import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { FinalWorksService } from './final-works.service';
import { FinalWorksController } from './final-works.controller';
import { FinalWorksRepository } from './final-works.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FinalWorksController],
  providers: [FinalWorksService, FinalWorksRepository, DtoValidator],
  exports: [FinalWorksService, FinalWorksRepository],
})
export class FinalWorksModule {}
