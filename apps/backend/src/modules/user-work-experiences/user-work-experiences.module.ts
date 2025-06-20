import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { UserWorkExperiencesService } from './user-work-experiences.service';
import { UserWorkExperiencesController } from './user-work-experiences.controller';
import { UserWorkExperiencesRepository } from './user-work-experiences.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserWorkExperiencesController],
  providers: [UserWorkExperiencesService, UserWorkExperiencesRepository, DtoValidator],
  exports: [UserWorkExperiencesService, UserWorkExperiencesRepository],
})
export class UserWorkExperiencesModule {}
