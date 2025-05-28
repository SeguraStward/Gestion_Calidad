import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { QuestionDto } from './dtos/question.dto';
import { Question } from '@una-gc/database/prisma/generated/client';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class QuestionsService extends GenericService<Question, QuestionDto, QuestionDto> {
  protected readonly logger = new Logger(QuestionsService.name);

  constructor(
    protected readonly questionsRepository: QuestionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(questionsRepository, QuestionDto);
  }
}
