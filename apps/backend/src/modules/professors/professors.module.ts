import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProfessorsService } from './professors.service';
import { ProfessorsController } from './professors.controller';
import { ProfessorsRepository } from './professors.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessorsController],
  providers: [ProfessorsService, ProfessorsRepository, DtoValidator],
  exports: [ProfessorsService, ProfessorsRepository],
})
export class ProfessorsModule {}
