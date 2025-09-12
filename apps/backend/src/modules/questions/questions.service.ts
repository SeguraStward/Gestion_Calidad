import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { QuestionDto } from './dtos/question.dto';
import { Question } from '@una-gc/database/prisma/generated/client';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class QuestionsService extends GenericService<Question, QuestionDto, QuestionDto> {
  protected readonly logger = new Logger(QuestionsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete Question because it has associated: none.',
  };

  constructor(
    protected readonly questionsRepository: QuestionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(questionsRepository, QuestionDto);
  }

  /**
   * Get questions by step number with optional report type filter
   */
  async getQuestionsByStep(stepNumber: number, reportType?: string) {
    const whereClause: any = {
      stepNumber,
      status: 'ACTIVE'
    };

    if (reportType) {
      whereClause.appliesTo = {
        has: reportType
      };
    }

    return this.questionsRepository.findAll(
      1, // page
      100, // limit - high limit for now
      whereClause,
      { createdAt: 'asc' },
      { group: true } // include
    );
  }

  /**
   * Get questions grouped by step number with optional report type filter
   */
  async getQuestionsGroupedByStep(stepNumber: number, reportType?: string) {
    const result = await this.getQuestionsByStep(stepNumber, reportType);
    const questions = result.data;

    // Group questions by group name
    const grouped = questions.reduce((acc, question: any) => {
      const groupName = question.group?.name || 'Sin Grupo';
      if (!acc[groupName]) {
        acc[groupName] = {
          group: question.group,
          questions: []
        };
      }
      acc[groupName].questions.push(question);
      return acc;
    }, {} as Record<string, { group: any; questions: any[] }>);

    return grouped;
  }

  /**
   * Get questions by step number and group ID
   */
  async getQuestionsByStepAndGroup(stepNumber: number, groupId: string, reportType?: string) {
    const whereClause: any = {
      stepNumber,
      groupId,
      status: 'ACTIVE'
    };

    if (reportType) {
      whereClause.appliesTo = {
        has: reportType
      };
    }

    return this.questionsRepository.findAll(
      1, // page
      100, // limit
      whereClause,
      { createdAt: 'asc' },
      { group: true } // include
    );
  }
}
