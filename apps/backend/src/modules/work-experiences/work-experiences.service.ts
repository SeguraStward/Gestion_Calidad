import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { WorkExperienceDto } from './dtos/work-experience.dto';
import { WorkExperience } from '@una-gc/database/prisma/generated/client';
import { WorkExperiencesRepository } from './work-experiences.repository';

@Injectable()
export class WorkExperiencesService extends GenericService<
  WorkExperience,
  WorkExperienceDto,
  WorkExperienceDto
> {
  protected readonly logger = new Logger(WorkExperiencesService.name);

  constructor(
    protected readonly workExperiencesRepository: WorkExperiencesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(workExperiencesRepository, WorkExperienceDto);
  }
}
