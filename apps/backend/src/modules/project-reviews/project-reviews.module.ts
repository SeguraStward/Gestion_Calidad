import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ProjectReviewsService } from './project-reviews.service';
import { ProjectReviewsController } from './project-reviews.controller';
import { ProjectReviewsRepository } from './project-reviews.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectReviewsController],
  providers: [ProjectReviewsService, ProjectReviewsRepository, DtoValidator],
  exports: [ProjectReviewsService, ProjectReviewsRepository],
})
export class ProjectReviewsModule {}
