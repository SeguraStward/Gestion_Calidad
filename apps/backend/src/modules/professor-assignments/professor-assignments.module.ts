import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProfessorAssignmentsController } from './professor-assignments.controller';
import { ProfessorAssignmentsService } from './professor-assignments.service';
import { ProfessorAssignmentsRepository } from './professor-assignments.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessorAssignmentsController],
  providers: [ProfessorAssignmentsService, ProfessorAssignmentsRepository, DtoValidator],
  exports: [ProfessorAssignmentsService],
})
export class ProfessorAssignmentsModule {}
