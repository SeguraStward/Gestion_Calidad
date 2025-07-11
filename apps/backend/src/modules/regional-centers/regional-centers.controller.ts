import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from '@una-gc/database/prisma/generated/client';

import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';
import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCentersService } from './regional-centers.service';

@ApiTags('Regional Centers')
@ResourceName('REGIONAL_CENTER')
@Controller('regional-centers')
export class RegionalCentersController extends GenericController<RegionalCenterDto, RegionalCenterDto> {
  protected readonly logger = new Logger(RegionalCentersController.name);
  protected readonly resourceName = 'REGIONAL_CENTER';

  constructor(private readonly regionalCentersService: RegionalCentersService) {
    super(regionalCentersService);
  }

  // Override findAll to support status filtering
  @Get()
  @ApiOperation({ summary: 'Find all regional centers with optional status filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: Status, description: 'Filter by status' })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'include', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Regional centers successfully retrieved' })
  @AuthorizedEndpoint(PermissionType.READ)
  override async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query() where: Record<string, any> = {},
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.debug('Finding all regional centers', { page, limit, where });

    const { page: _p, limit: _l, orderBy: _o, include: _i, status, ...filters } = where;

    // Build where conditions
    const finalWhere = {
      ...filters,
      ...(status && { status }),
    };

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.regionalCentersService.findAll(
      Number(page),
      Number(limit),
      Object.keys(finalWhere).length ? finalWhere : undefined,
      parsedOrderBy,
    );
  }

  // Custom endpoint for finding regional centers by campus
  @Get('campus/:campusId')
  @ApiOperation({ summary: 'Find all regional centers for a specific campus' })
  @ApiParam({ name: 'campusId', type: String, description: 'Campus ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: Status, description: 'Filter by status' })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Regional centers for campus successfully retrieved' })
  @AuthorizedEndpoint(PermissionType.READ)
  async findAllByCampusId(
    @Param('campusId') campusId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('status', new ParseEnumPipe(Status, { optional: true })) status?: Status,
    @Query('orderBy') orderBy?: string,
  ) {
    this.logger.debug(
      `Finding regional centers for campus ${campusId} - page: ${page}, limit: ${limit}, status: ${status}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.regionalCentersService.findAllByCampusId(campusId, page, limit, status, parsedOrderBy);
  }
}
