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

import { buildPrismaInclude } from '@src/core/common/utils';
import { FinalReportStatus, PermissionType, PermissionScope } from '@una-gc/database/prisma/generated/client';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsService } from './final-reports.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { RequirePermissions, RESOURCE_NAME_TOKEN } from '@src/modules/auth/decorators/require-permissions.decorator';

@ResourceName('FINAL_REPORT')
@Controller('final-reports')
export class FinalReportsController extends GenericController<FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsController.name);
  protected readonly resourceName = 'FINAL_REPORT';
  constructor(private readonly finalReportsService: FinalReportsService) {
    super(finalReportsService);
  }

  @Get('admin/all')
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.READ, scope: PermissionScope.ALL })
  async findAllForAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status', new ParseEnumPipe(FinalReportStatus, { optional: true })) status?: FinalReportStatus,
    @Query('professorId') professorId?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.log(
      `Admin request: Find all final reports - status: ${status}, professorId: ${professorId}, page: ${page}, limit: ${limit}, search: ${search}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.finalReportsService.findAllForAdmin(
      page,
      limit,
      status,
      professorId,
      search,
      parsedOrderBy,
      prismaInclude,
    );
  }

  @Get('professor/:professorId')
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.READ, scope: PermissionScope.OWN })
  async findAllByProfessorId(
    @Param('professorId') professorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status', new ParseEnumPipe(FinalReportStatus, { optional: true })) status?: FinalReportStatus,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.log(
      `Request to find all final reports for professorId: ${professorId}, status: ${status}, page: ${page}, limit: ${limit}, search: ${search}, orderBy: ${orderBy}, include: ${includeQueryParam}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.finalReportsService.findAllByProfessorId(
      professorId,
      page,
      limit,
      status,
      search,
      parsedOrderBy,
      prismaInclude,
    );
  }
}
