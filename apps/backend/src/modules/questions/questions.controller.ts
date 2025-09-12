import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Get, Param, ParseIntPipe, Query, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';

import { QuestionDto } from './dtos/question.dto';
import { QuestionsService } from './questions.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Questions')
@ResourceName('QUESTION')
@Controller('questions')
export class QuestionsController extends GenericController<QuestionDto, QuestionDto> {
  protected readonly logger = new Logger(QuestionsController.name);
  protected readonly resourceName = 'QUESTION';

  constructor(private readonly questionsService: QuestionsService) {
    super(questionsService);
  }

  @Get('step/:stepNumber')
  @ApiOperation({ summary: 'Get questions by step number' })
  @ApiParam({ name: 'stepNumber', description: 'Step number (5 or 7)', type: Number })
  @ApiQuery({ name: 'reportType', description: 'Report type filter', required: false })
  @ApiResponse({
    status: 200,
    description: 'Questions found successfully',
    type: [QuestionDto]
  })
  async getQuestionsByStep(
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Query('reportType') reportType?: string
  ) {
    return this.questionsService.getQuestionsByStep(stepNumber, reportType);
  }

  @Get('step/:stepNumber/groups')
  @ApiOperation({ summary: 'Get questions grouped by step number' })
  @ApiParam({ name: 'stepNumber', description: 'Step number (5 or 7)', type: Number })
  @ApiQuery({ name: 'reportType', description: 'Report type filter', required: false })
  @ApiResponse({
    status: 200,
    description: 'Grouped questions found successfully'
  })
  async getQuestionsGroupedByStep(
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Query('reportType') reportType?: string
  ) {
    return this.questionsService.getQuestionsGroupedByStep(stepNumber, reportType);
  }

  // Override create method to return complete question data
  @Post()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record successfully created' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: QuestionDto) {
    const result = await this.questionsService.save(createDto);
    // Return the result with question field for proper frontend display
    return {
      ...result,
      question: createDto.question
    };
  }
}
