import { GenericService } from '@core/common/interfaces/generic.service';

import { DtoValidator } from '@core/common/dto-validator';

import { Injectable, Logger } from '@nestjs/common';

import { SchoolDto } from './dtos/school.dto';

import { School } from '@una-gc/database/prisma/generated/client';

import { SchoolsRepository } from './schools.repository';

@Injectable()
export class SchoolsService extends GenericService<School, SchoolDto, SchoolDto> {
  protected readonly logger = new Logger(SchoolsService.name);

  constructor(
    protected readonly schoolsRepository: SchoolsRepository,

    protected readonly dtoValidator: DtoValidator,
  ) {
    super(schoolsRepository, SchoolDto);
  }
}
