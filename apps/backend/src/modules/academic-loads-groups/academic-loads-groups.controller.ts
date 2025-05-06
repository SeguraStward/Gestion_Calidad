import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { AcademicLoadsGroupDto } from './dtos/academic-loads-group.dto';
import { AcademicLoadsGroupsService } from './academic-loads-groups.service';

@Controller('academic-loads-groups')
export class AcademicLoadsGroupsController extends GenericController<
  AcademicLoadsGroupDto,
  AcademicLoadsGroupDto
> {
  protected readonly logger = new Logger(AcademicLoadsGroupsController.name);
  constructor(private readonly academicLoadsGroupsService: AcademicLoadsGroupsService) {
    super(academicLoadsGroupsService);
  }
}
