import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { QuestionGroupsService } from './question-groups.service';
import { QuestionGroupsController } from './question-groups.controller';
import { QuestionGroupsRepository } from './question-groups.repository';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionGroupsController],
  providers: [QuestionGroupsService, QuestionGroupsRepository, DtoValidator],
  exports: [QuestionGroupsService, QuestionGroupsRepository],
})
export class QuestionGroupsModule {}
