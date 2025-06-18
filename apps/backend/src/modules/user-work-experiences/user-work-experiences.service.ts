import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { UserWorkExperienceDto } from './dtos/user-work-experience.dto';
import { UserWorkExperience } from '@una-gc/database/prisma/generated/client';
import { UserWorkExperiencesRepository } from './user-work-experiences.repository';

@Injectable()
export class UserWorkExperiencesService extends GenericService<
  UserWorkExperience,
  UserWorkExperienceDto,
  UserWorkExperienceDto
> {
  protected readonly logger = new Logger(UserWorkExperiencesService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete UserWorkExperience because it has associated: none.',
  };

  constructor(
    protected readonly userWorkExperiencesRepository: UserWorkExperiencesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(userWorkExperiencesRepository, UserWorkExperienceDto);
  }
}
