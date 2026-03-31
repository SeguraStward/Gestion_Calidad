import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { AcademicCycleDto } from './dtos/academic-cycle.dto';
import { AcademicCyclesService } from './academic-cycles.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthorizedEndpoint } from '@core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ResourceName('ACADEMIC_CYCLE')
@Controller('academic-cycles')
export class AcademicCyclesController extends GenericController<AcademicCycleDto, AcademicCycleDto> {
  protected readonly logger = new Logger(AcademicCyclesController.name);
  protected readonly resourceName = 'ACADEMIC_CYCLE';
  constructor(private readonly academicCyclesService: AcademicCyclesService) {
    super(academicCyclesService);
  }

  @Get()
  @ApiOperation({ summary: 'Find all academic cycles with optional search by name or code' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or code' })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'include', required: false, type: String })
  @AuthorizedEndpoint(PermissionType.READ)
  override async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query() where: Record<string, any> = {},
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    const { page: _p, limit: _l, orderBy: _o, include: _i, search, ...filters } = where;

    let searchConditions = {};
    if (search) {
      searchConditions = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const finalWhere =
      Object.keys(filters).length || search ? { ...searchConditions, ...filters } : undefined;
    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.academicCyclesService.findAll(Number(page), Number(limit), finalWhere, parsedOrderBy);
  }
}
