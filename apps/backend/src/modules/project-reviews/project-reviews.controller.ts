import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProjectReviewDto } from './dtos/project-review.dto';
import { ProjectReviewsService } from './project-reviews.service';

@Controller('project-reviews')
export class ProjectReviewsController extends GenericController<ProjectReviewDto, ProjectReviewDto> {
  protected readonly logger = new Logger(ProjectReviewsController.name);
  protected readonly resourceName = 'PROJECT_REVIEW';
  constructor(private readonly projectReviewsService: ProjectReviewsService) {
    super(projectReviewsService);
  }
}
