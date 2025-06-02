import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { AcademicLoadGroupDto } from './dtos/academic-load-group.dto';
import { AcademicLoadGroupsService } from './academic-load-groups.service';

@Controller('academic-load-groups')
export class AcademicLoadGroupsController extends GenericController<
  AcademicLoadGroupDto,
  AcademicLoadGroupDto
> {
  protected readonly logger = new Logger(AcademicLoadGroupsController.name);
  protected readonly resourceName = 'ACADEMIC_LOAD_GROUP';
  constructor(private readonly academicLoadGroupsService: AcademicLoadGroupsService) {
    super(academicLoadGroupsService);
  }
}
