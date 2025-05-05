import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicLoadsGroupsService } from './academic-loads-groups.service';
import { AcademicLoadsGroupsController } from './academic-loads-groups.controller';
import { AcademicLoadsGroupsRepository } from './academic-loads-groups.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicLoadsGroupsController],
  providers: [AcademicLoadsGroupsService, AcademicLoadsGroupsRepository, DtoValidator],
  exports: [AcademicLoadsGroupsService, AcademicLoadsGroupsRepository],
})
export class AcademicLoadsGroupsModule {}
