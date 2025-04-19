import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { FinalWorksService } from './final-works.service';
import { FinalWorksController } from './final-works.controller';
import { FinalWorksRepository } from './final-works.repository';

@Module({
  controllers: [FinalWorksController],
  providers: [PrismaService, FinalWorksService, FinalWorksRepository, DtoValidator],
  exports: [FinalWorksService, FinalWorksRepository],
})
export class FinalWorksModule {}
