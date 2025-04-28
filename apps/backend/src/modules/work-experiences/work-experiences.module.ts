import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { WorkExperiencesService } from './work-experiences.service';
import { WorkExperiencesController } from './work-experiences.controller';
import { WorkExperiencesRepository } from './work-experiences.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WorkExperiencesController],
  providers: [WorkExperiencesService, WorkExperiencesRepository, DtoValidator],
  exports: [WorkExperiencesService, WorkExperiencesRepository],
})
export class WorkExperiencesModule {}
