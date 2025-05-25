import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProjectReviewDto } from './dtos/project-review.dto';
import { ProjectReview } from '@una-gc/database/prisma/generated/client';
import { ProjectReviewsRepository } from './project-reviews.repository';

@Injectable()
export class ProjectReviewsService extends GenericService<ProjectReview, ProjectReviewDto, ProjectReviewDto> {
  protected readonly logger = new Logger(ProjectReviewsService.name);

  constructor(
    protected readonly projectReviewsRepository: ProjectReviewsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(projectReviewsRepository, ProjectReviewDto);
  }
}
