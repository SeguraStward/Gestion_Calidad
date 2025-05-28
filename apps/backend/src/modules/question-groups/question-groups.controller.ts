import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroupsService } from './question-groups.service';

@Controller('question-groups')
export class QuestionGroupsController extends GenericController<QuestionGroupDto, QuestionGroupDto> {
  protected readonly logger = new Logger(QuestionGroupsController.name);
  constructor(private readonly questionGroupsService: QuestionGroupsService) {
    super(questionGroupsService);
  }
}
