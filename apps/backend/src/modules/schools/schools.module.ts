import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DtoValidator } from '@core/common/dto-validator';

import { SchoolsService } from './schools.service';

import { SchoolsController } from './schools.controller';

import { SchoolsRepository } from './schools.repository';

@Module({
  imports: [PrismaModule],

  controllers: [SchoolsController],

  providers: [SchoolsService, SchoolsRepository, DtoValidator],

  exports: [SchoolsService, SchoolsRepository],
})
export class SchoolsModule {}
