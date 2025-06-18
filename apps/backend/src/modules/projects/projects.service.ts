import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProjectDto } from './dtos/project.dto';
import { Project } from '@una-gc/database/prisma/generated/client';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService extends GenericService<Project, ProjectDto, ProjectDto> {
  protected readonly logger = new Logger(ProjectsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['documents', 'reviews'],
    errorMessage: 'Cannot delete Project because it has associated: documents, reviews.',
  };

  constructor(
    protected readonly projectsRepository: ProjectsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(projectsRepository, ProjectDto);
  }
}
