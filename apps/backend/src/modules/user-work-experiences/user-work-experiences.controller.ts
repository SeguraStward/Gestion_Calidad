import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { UserWorkExperienceDto } from './dtos/user-work-experience.dto';
import { UserWorkExperiencesService } from './user-work-experiences.service';

@Controller('user-work-experiences')
export class UserWorkExperiencesController extends GenericController<
  UserWorkExperienceDto,
  UserWorkExperienceDto
> {
  protected readonly logger = new Logger(UserWorkExperiencesController.name);
  constructor(private readonly userWorkExperiencesService: UserWorkExperiencesService) {
    super(userWorkExperiencesService);
  }
}
