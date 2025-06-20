import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroupsService } from './question-groups.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('QUESTION_GROUP')
@Controller('question-groups')
export class QuestionGroupsController extends GenericController<QuestionGroupDto, QuestionGroupDto> {
  protected readonly logger = new Logger(QuestionGroupsController.name);
  protected readonly resourceName = 'QUESTION_GROUP';
  constructor(private readonly questionGroupsService: QuestionGroupsService) {
    super(questionGroupsService);
  }
}
