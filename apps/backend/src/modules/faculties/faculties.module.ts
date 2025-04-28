import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { FacultiesRepository } from './faculties.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FacultiesController],
  providers: [FacultiesService, FacultiesRepository, DtoValidator],
  exports: [FacultiesService, FacultiesRepository],
})
export class FacultiesModule {}
