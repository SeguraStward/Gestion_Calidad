import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DtoValidator } from '@core/common/dto-validator';

import { AcademicBackgroundsService } from './academic-backgrounds.service';

import { AcademicBackgroundsController } from './academic-backgrounds.controller';

import { AcademicBackgroundsRepository } from './academic-backgrounds.repository';

@Module({
  imports: [PrismaModule],

  controllers: [AcademicBackgroundsController],

  providers: [AcademicBackgroundsService, AcademicBackgroundsRepository, DtoValidator],

  exports: [AcademicBackgroundsService, AcademicBackgroundsRepository],
})
export class AcademicBackgroundsModule {}
