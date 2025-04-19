import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { FacultiesRepository } from './faculties.repository';

@Module({
  controllers: [FacultiesController],
  providers: [PrismaService, FacultiesService, FacultiesRepository, DtoValidator],
  exports: [FacultiesService, FacultiesRepository],
})
export class FacultiesModule {}
