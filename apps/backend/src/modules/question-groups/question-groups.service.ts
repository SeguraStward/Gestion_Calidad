import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroup } from '@una-gc/database/prisma/generated/client';
import { QuestionGroupsRepository } from './question-groups.repository';
import { PrismaService } from '@src/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    super(questionGroupsRepository, QuestionGroupDto);
  }

  /**
   * Override deleteById to only check for ACTIVE related questions
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      // First, check if the question group exists
      const entity = await this.questionGroupsRepository.findById(id);

      if (!entity) {
        throw new Error(`QuestionGroup with id ${id} not found`);
      }

      // Then, count only ACTIVE questions associated with this group
      const activeQuestionsCount = await this.prisma.question.count({
        where: {
          groupId: id,
          status: 'ACTIVE'
        }
      });

      // Check if there are any ACTIVE questions associated
      if (activeQuestionsCount > 0) {
        throw new Error('Cannot delete QuestionGroup because it has associated: questions.');
      }

      return this.questionGroupsRepository.deleteById(id);
    } catch (error) {
      this.logger.error(`Error deleting entity with id ${id}:`, error);
      throw error;
    }
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

    // Include only ACTIVE questions to match the deletion check logic
    return this.questionGroupsRepository.findAll(
      1, // page
      100, // limit
      whereClause,
      { createdAt: 'asc' },
      {
        questions: {
          where: {
            status: 'ACTIVE'
          }
        }
      } // include only active questions
    );
  }
}
