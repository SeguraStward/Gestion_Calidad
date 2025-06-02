import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { QuestionDto } from './dtos/question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController extends GenericController<QuestionDto, QuestionDto> {
  protected readonly logger = new Logger(QuestionsController.name);
  protected readonly resourceName = 'QUESTION';
  constructor(private readonly questionsService: QuestionsService) {
    super(questionsService);
  }
}
