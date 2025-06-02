import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProjectLogDto } from './dtos/project-log.dto';
import { ProjectLogsService } from './project-logs.service';

@Controller('project-logs')
export class ProjectLogsController extends GenericController<ProjectLogDto, ProjectLogDto> {
  protected readonly logger = new Logger(ProjectLogsController.name);
  protected readonly resourceName = 'PROJECT_LOG';
  constructor(private readonly projectLogsService: ProjectLogsService) {
    super(projectLogsService);
  }
}
