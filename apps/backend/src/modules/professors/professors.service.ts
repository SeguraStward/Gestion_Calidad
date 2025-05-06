import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProfessorDto } from './dtos/professor.dto';
import { Professor } from '@una-gc/database/prisma/generated/client';
import { ProfessorsRepository } from './professors.repository';

@Injectable()
export class ProfessorsService extends GenericService<Professor, ProfessorDto, ProfessorDto> {
  protected readonly logger = new Logger(ProfessorsService.name);

  constructor(
    protected readonly professorsRepository: ProfessorsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(professorsRepository, ProfessorDto);
  }
}
