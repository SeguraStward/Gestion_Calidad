import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroup } from '@una-gc/database/prisma/generated/client';
import { QuestionGroupsRepository } from './question-groups.repository';

@Injectable()
export class QuestionGroupsService extends GenericService<QuestionGroup, QuestionGroupDto, QuestionGroupDto> {
  protected readonly logger = new Logger(QuestionGroupsService.name);

  constructor(
    protected readonly questionGroupsRepository: QuestionGroupsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(questionGroupsRepository, QuestionGroupDto);
  }
}
