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

    return this.regionalCentersService.findAllByCampusId(campusId, page, limit, status, parsedOrderBy);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status', new ParseEnumPipe(Status, { optional: true })) status?: Status,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
    @Query() rawQuery?: any,
  ) {
    this.logger.log(`--- REGIONAL CENTERS DEBUG ---`);
    this.logger.log(`rawQuery: ${JSON.stringify(rawQuery)}`);
    this.logger.log(
      `page: ${page}, limit: ${limit}, status: ${status}, orderBy: ${orderBy}, include: ${includeQueryParam}`,
    );
    try {
      const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
      const prismaInclude = buildPrismaInclude(includeQueryParam);
      // Solo pasa los argumentos que acepta el servicio
      const where = status ? { status } : undefined;
      return await this.regionalCentersService.findAll(page, limit, where, parsedOrderBy);
    } catch (err) {
      this.logger.error('Error in findAll:', err);
      throw err;
    }
  }
}
