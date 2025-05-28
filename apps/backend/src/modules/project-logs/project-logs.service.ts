import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProjectLogDto } from './dtos/project-log.dto';
import { ProjectLog } from '@una-gc/database/prisma/generated/client';
import { ProjectLogsRepository } from './project-logs.repository';

@Injectable()
export class ProjectLogsService extends GenericService<ProjectLog, ProjectLogDto, ProjectLogDto> {
  protected readonly logger = new Logger(ProjectLogsService.name);

  constructor(
    protected readonly projectLogsRepository: ProjectLogsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(projectLogsRepository, ProjectLogDto);
  }
}
