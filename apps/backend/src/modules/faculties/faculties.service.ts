import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { FacultyDto } from './dtos/faculty.dto';
import { Faculty } from '@una-gc/database/prisma/generated/client';
import { FacultiesRepository } from './faculties.repository';

@Injectable()
export class FacultiesService extends GenericService<Faculty, FacultyDto, FacultyDto> {
  protected readonly logger = new Logger(FacultiesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['schools'],
    errorMessage: 'Cannot delete Faculty because it has associated: schools.',
  };

  constructor(
    protected readonly facultiesRepository: FacultiesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(facultiesRepository, FacultyDto);
  }
}
