import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CampusesService } from './campuses.service';
import { CampusesController } from './campuses.controller';
import { CampusesRepository } from './campuses.repository';

@Module({
  imports: [PrismaModule],
  imports: [PrismaModule],
  controllers: [CampusesController],
  providers: [CampusesService, CampusesRepository, DtoValidator],
  exports: [CampusesService, CampusesRepository],
})
export class CampusesModule {}
