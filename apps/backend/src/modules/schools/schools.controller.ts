import { GenericController } from '@core/common/interfaces/generic.controller';

import { Controller, Logger } from '@nestjs/common';

import { SchoolDto } from './dtos/school.dto';

import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController extends GenericController<SchoolDto, SchoolDto> {
  protected readonly logger = new Logger(SchoolsController.name);

  constructor(private readonly schoolsService: SchoolsService) {
    super(schoolsService);
  }
}
