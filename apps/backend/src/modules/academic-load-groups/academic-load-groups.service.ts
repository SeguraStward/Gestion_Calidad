import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { AcademicLoadGroupDto } from './dtos/academic-load-group.dto';
import { AcademicLoadGroup } from '@una-gc/database/prisma/generated/client';
import { AcademicLoadGroupsRepository } from './academic-load-groups.repository';

@Injectable()
export class AcademicLoadGroupsService extends GenericService<
  AcademicLoadGroup,
  AcademicLoadGroupDto,
  AcademicLoadGroupDto
> {
  protected readonly logger = new Logger(AcademicLoadGroupsService.name);

  constructor(
    protected readonly academicLoadGroupsRepository: AcademicLoadGroupsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadGroupsRepository, AcademicLoadGroupDto);
  }
}
