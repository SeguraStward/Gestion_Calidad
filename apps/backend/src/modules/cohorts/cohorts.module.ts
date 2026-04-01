import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';

import { CohortsController } from './cohorts.controller';
import { CohortsService } from './cohorts.service';
import { CohortsRepository } from './cohorts.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CohortsController],
  providers: [CohortsService, CohortsRepository],
  exports: [CohortsService, CohortsRepository],
})
export class CohortsModule {}
