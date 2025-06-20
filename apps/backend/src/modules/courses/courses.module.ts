import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './courses.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository, DtoValidator],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
