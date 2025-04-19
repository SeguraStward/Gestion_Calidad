import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './courses.repository';

@Module({
  controllers: [CoursesController],
  providers: [PrismaService, CoursesService, CoursesRepository, DtoValidator],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
