import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { WorkExperiencesService } from './work-experiences.service';
import { WorkExperiencesController } from './work-experiences.controller';
import { WorkExperiencesRepository } from './work-experiences.repository';

@Module({
  controllers: [WorkExperiencesController],
  providers: [PrismaService, WorkExperiencesService, WorkExperiencesRepository, DtoValidator],
  exports: [WorkExperiencesService, WorkExperiencesRepository],
})
export class WorkExperiencesModule {}
