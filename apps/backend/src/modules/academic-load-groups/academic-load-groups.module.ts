import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { AcademicLoadGroupsService } from './academic-load-groups.service';
import { AcademicLoadGroupsController } from './academic-load-groups.controller';
import { AcademicLoadGroupsRepository } from './academic-load-groups.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicLoadGroupsController],
  providers: [AcademicLoadGroupsService, AcademicLoadGroupsRepository, DtoValidator],
  exports: [AcademicLoadGroupsService, AcademicLoadGroupsRepository],
})
export class AcademicLoadGroupsModule {}
