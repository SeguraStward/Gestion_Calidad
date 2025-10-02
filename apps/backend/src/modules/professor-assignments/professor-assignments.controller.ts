import { Controller, Logger } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';

import { ProfessorAssignmentsService } from './professor-assignments.service';
import { ProfessorAssignmentDto } from './dtos/professor-assignment.dto';
import { CreateProfessorAssignmentDto } from './dtos/create-professor-assignment.dto';
import { UpdateProfessorAssignmentDto } from './dtos/update-professor-assignment.dto';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('PROFESSOR_ASSIGNMENT')
@Controller('professor-assignments')
export class ProfessorAssignmentsController extends GenericController<
  ProfessorAssignmentDto,
  CreateProfessorAssignmentDto,
  UpdateProfessorAssignmentDto
> {
  protected readonly logger = new Logger(ProfessorAssignmentsController.name);
  protected readonly resourceName = 'PROFESSOR_ASSIGNMENT';

  constructor(private readonly serviceImpl: ProfessorAssignmentsService) {
    super(serviceImpl);
  }
}
