import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { WorkExperienceDto } from './dtos/work-experience.dto';
import { WorkExperiencesService } from './work-experiences.service';

@Controller('work-experiences')
export class WorkExperiencesController extends GenericController<WorkExperienceDto, WorkExperienceDto> {
  protected readonly logger = new Logger(WorkExperiencesController.name);
  constructor(private readonly workExperiencesService: WorkExperiencesService) {
    super(workExperiencesService);
  }
}
