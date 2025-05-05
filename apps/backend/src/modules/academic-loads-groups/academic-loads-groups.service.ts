import { GenericService } from '@core/common/interfaces/generic.service';

import { DtoValidator } from '@core/common/dto-validator';

import { Injectable, Logger } from '@nestjs/common';

import { AcademicLoadsGroupDto } from './dtos/academic-loads-group.dto';

import { AcademicLoadsGroup } from '@una-gc/database/prisma/generated/client';

import { AcademicLoadsGroupsRepository } from './academic-loads-groups.repository';

@Injectable()
export class AcademicLoadsGroupsService extends GenericService<
  AcademicLoadsGroup,
  AcademicLoadsGroupDto,
  AcademicLoadsGroupDto
> {
  protected readonly logger = new Logger(AcademicLoadsGroupsService.name);

  constructor(
    protected readonly academicLoadsGroupsRepository: AcademicLoadsGroupsRepository,

    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadsGroupsRepository, AcademicLoadsGroupDto);
  }
}
