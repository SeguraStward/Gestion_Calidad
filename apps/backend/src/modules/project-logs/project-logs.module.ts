import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProjectLogsService } from './project-logs.service';
import { ProjectLogsController } from './project-logs.controller';
import { ProjectLogsRepository } from './project-logs.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectLogsController],
  providers: [ProjectLogsService, ProjectLogsRepository, DtoValidator],
  exports: [ProjectLogsService, ProjectLogsRepository],
})
export class ProjectLogsModule {}
