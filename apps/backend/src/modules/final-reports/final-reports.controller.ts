import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { buildPrismaInclude } from '@src/utils/prisma-include.parser';
import { FinalReportStatus } from '@una-gc/database/prisma/generated/client';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsService } from './final-reports.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('FINAL_REPORT')
@Controller('final-reports')
export class FinalReportsController extends GenericController<FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsController.name);
  protected readonly resourceName = 'FINAL_REPORT';
  constructor(private readonly finalReportsService: FinalReportsService) {
    super(finalReportsService);
  }

  @Get('professor/:professorId')
  async findAllByProfessorId(
    @Param('professorId') professorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status', new ParseEnumPipe(FinalReportStatus, { optional: true })) status?: FinalReportStatus,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.log(
      `Request to find all final reports for professorId: ${professorId}, status: ${status}, page: ${page}, limit: ${limit}, orderBy: ${orderBy}, include: ${includeQueryParam}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.finalReportsService.findAllByProfessorId(
      professorId,
      page,
      limit,
      status,
      parsedOrderBy,
      prismaInclude,
    );
  }
}
