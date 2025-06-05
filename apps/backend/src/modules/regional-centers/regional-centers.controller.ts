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
import { Status } from '@una-gc/database/prisma/generated/client';

import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCentersService } from './regional-centers.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('REGIONAL_CENTER')
@Controller('regional-centers')
export class RegionalCentersController extends GenericController<RegionalCenterDto, RegionalCenterDto> {
  protected readonly logger = new Logger(RegionalCentersController.name);
  protected readonly resourceName = 'REGIONAL_CENTER';
  constructor(private readonly regionalCentersService: RegionalCentersService) {
    super(regionalCentersService);
  }

  @Get('campus/:campusId')
  async findAllByCampusId(
    @Param('campusId') campusId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status', new ParseEnumPipe(Status, { optional: true })) status?: Status,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.log(
      `Request to find all regional centers for campusId: ${campusId}, status: ${status}, page: ${page}, limit: ${limit}, orderBy: ${orderBy}, include: ${includeQueryParam}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.regionalCentersService.findAllByCampusId(
      campusId,
      page,
      limit,
      status,
      parsedOrderBy
    );
  }
}
