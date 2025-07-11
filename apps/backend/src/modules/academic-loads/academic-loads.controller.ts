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
import { AcademicLoadsService } from './academic-loads.service';
import { AcademicLoadDto } from './dtos/academic-load.dto';

@ApiTags('Academic Loads')
@ResourceName('ACADEMIC_LOAD')
@Controller('academic-loads')
export class AcademicLoadsController extends GenericController<AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsController.name);
  protected readonly resourceName = 'ACADEMIC_LOAD';

  constructor(private readonly academicLoadsService: AcademicLoadsService) {
    super(academicLoadsService);
  }

  // Override findAll to support search functionality
  @Get()
  @ApiOperation({ summary: 'Find all academic loads with search functionality' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by NRC, course name, or professor name',
  })
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

    // Build search conditions if search parameter is provided
    let searchConditions = {};
    if (search) {
      searchConditions = {
        OR: [
          { nrc: { contains: search, mode: 'insensitive' } },
          { course: { name: { contains: search, mode: 'insensitive' } } },
          { professor: { fullName: { contains: search, mode: 'insensitive' } } },
          { professor: { fullLastName: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    // Combine search conditions with other filters
    const finalWhere =
      Object.keys(filters).length || search ? { ...searchConditions, ...filters } : undefined;

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.academicLoadsService.findAll(Number(page), Number(limit), finalWhere, parsedOrderBy);
  }

  // Custom endpoint for finding academic loads by professor
  @Get('professor/:professorId')
  @ApiOperation({ summary: 'Find all academic loads for a specific professor' })
  @ApiParam({ name: 'professorId', type: String, description: 'Professor ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: Status, description: 'Filter by status' })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Academic loads for professor successfully retrieved' })
  @AuthorizedEndpoint(PermissionType.READ)
  async findAllByProfessorId(
    @Param('professorId') professorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('status', new ParseEnumPipe(Status, { optional: true })) status?: Status,
    @Query('orderBy') orderBy?: string,
  ) {
    this.logger.debug(
      `Finding academic loads for professor ${professorId} - page: ${page}, limit: ${limit}, status: ${status}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.academicLoadsService.findAllByProfessorId(professorId, page, limit, status, parsedOrderBy);
  }
}
