import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProfessorDto } from './dtos/professor.dto';
import { ProfessorsService } from './professors.service';

@Controller('professors')
export class ProfessorsController extends GenericController<ProfessorDto, ProfessorDto> {
  protected readonly logger = new Logger(ProfessorsController.name);
  constructor(private readonly professorsService: ProfessorsService) {
    super(professorsService);
  }
}
