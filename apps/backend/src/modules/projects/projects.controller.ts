import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProjectDto } from './dtos/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController extends GenericController<ProjectDto, ProjectDto> {
  protected readonly logger = new Logger(ProjectsController.name);
  protected readonly resourceName = 'PROJECT';
  constructor(private readonly projectsService: ProjectsService) {
    super(projectsService);
  }
}
