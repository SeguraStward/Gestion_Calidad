import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { QuestionGroupDto } from './dtos/question-group.dto';
import { QuestionGroupsService } from './question-groups.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Question Groups')
@ResourceName('QUESTION_GROUP')
@Controller('question-groups')
export class QuestionGroupsController extends GenericController<QuestionGroupDto, QuestionGroupDto> {
  protected readonly logger = new Logger(QuestionGroupsController.name);
  protected readonly resourceName = 'QUESTION_GROUP';

  constructor(private readonly questionGroupsService: QuestionGroupsService) {
    super(questionGroupsService);
  }

  @Get('step/:stepNumber')
  @ApiOperation({ summary: 'Get question groups by step number' })
  @ApiParam({ name: 'stepNumber', description: 'Step number (5 or 7)', type: Number })
  @ApiQuery({ name: 'reportType', description: 'Report type filter', required: false })
  @ApiResponse({
    status: 200,
    description: 'Question groups found successfully',
    type: [QuestionGroupDto]
  })
  async getQuestionGroupsByStep(
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Query('reportType') reportType?: string
  ) {
    return this.questionGroupsService.getQuestionGroupsByStep(stepNumber, reportType);
  }

  @Get('step/:stepNumber/with-questions')
  @ApiOperation({ summary: 'Get question groups with their questions by step number' })
  @ApiParam({ name: 'stepNumber', description: 'Step number (5 or 7)', type: Number })
  @ApiQuery({ name: 'reportType', description: 'Report type filter', required: false })
  @ApiResponse({
    status: 200,
    description: 'Question groups with questions found successfully'
  })
  async getQuestionGroupsWithQuestionsByStep(
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Query('reportType') reportType?: string
  ) {
    return this.questionGroupsService.getQuestionGroupsWithQuestionsByStep(stepNumber, reportType);
  }
}
