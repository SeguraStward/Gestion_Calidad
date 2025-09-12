import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroup } from '@una-gc/database/prisma/generated/client';
import { QuestionGroupsRepository } from './question-groups.repository';

@Injectable()
export class QuestionGroupsService extends GenericService<QuestionGroup, QuestionGroupDto, QuestionGroupDto> {
  protected readonly logger = new Logger(QuestionGroupsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['questions'],
    errorMessage: 'Cannot delete QuestionGroup because it has associated: questions.',
  };

  constructor(
    protected readonly questionGroupsRepository: QuestionGroupsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(questionGroupsRepository, QuestionGroupDto);
  }

  /**
   * Get question groups by step number with optional report type filter
   */
  async getQuestionGroupsByStep(stepNumber: number, reportType?: string) {
    const whereClause: any = {
      stepNumber,
      status: 'ACTIVE'
    };

    if (reportType) {
      whereClause.appliesTo = {
        has: reportType
      };
    }

    return this.questionGroupsRepository.findAll(
      1, // page
      100, // limit - high limit for now
      whereClause,
      { createdAt: 'asc' }
    );
  }

  /**
   * Get question groups with their questions by step number with optional report type filter
   */
  async getQuestionGroupsWithQuestionsByStep(stepNumber: number, reportType?: string) {
    const whereClause: any = {
      stepNumber,
      status: 'ACTIVE'
    };

    if (reportType) {
      whereClause.appliesTo = {
        has: reportType
      };
    }

    // Simplified include without complex filtering to avoid Prisma issues
    return this.questionGroupsRepository.findAll(
      1, // page
      100, // limit
      whereClause,
      { createdAt: 'asc' },
      {
        questions: true
      } // include
    );
  }
}
