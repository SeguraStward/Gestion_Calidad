import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CampusDto } from './dtos/campus.dto';
import { Campus } from '@una-gc/database/prisma/generated/client';
import { CampusesRepository } from './campuses.repository';

@Injectable()
export class CampusesService extends GenericService<Campus, CampusDto, CampusDto> {
  protected readonly logger = new Logger(CampusesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['classrooms', 'academicLoads'],
    errorMessage: 'Cannot delete Campus because it has associated: classrooms, academicLoads.',
  };

  constructor(
    protected readonly campusesRepository: CampusesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(campusesRepository, CampusDto);
  }
}
