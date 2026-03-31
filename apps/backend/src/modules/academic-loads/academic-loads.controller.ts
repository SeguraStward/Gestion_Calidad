import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from '@una-gc/database/prisma/generated/client';

import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';
import { AcademicLoadsService } from './academic-loads.service';
import { AcademicLoadDto } from './dtos/academic-load.dto';
import { BulkImportAcademicLoadsDto } from './dtos/bulk-import-academic-loads.dto';

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
  @ApiOperation({ summary: 'Find all academic loads with search and filter functionality' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by NRC, course name, or professor name' })
  @ApiQuery({ name: 'academicCycleId', required: false, type: String, description: 'Filter by academic cycle ID' })
  @ApiQuery({ name: 'courseId', required: false, type: String, description: 'Filter by course ID' })
  @ApiQuery({ name: 'professorId', required: false, type: String, description: 'Filter by professor ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'], description: 'Filter by status' })
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
    const {
      page: _p, limit: _l, orderBy: _o, include: _i,
      search,
      academicCycleId,
      courseId,
      professorId,
      status,
    } = where;

    // Búsqueda de texto libre
    const searchConditions = search
      ? {
          OR: [
            { nrc: { contains: search, mode: 'insensitive' } },
            { course: { name: { contains: search, mode: 'insensitive' } } },
            { professor: { fullName: { contains: search, mode: 'insensitive' } } },
            { professor: { fullLastName: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    // Filtros directos por ID y estado (solo se incluyen si tienen valor)
    const directFilters = {
      ...(academicCycleId && { academicCycleId }),
      ...(courseId && { courseId }),
      ...(professorId && { professorId }),
      ...(status && { status }),
    };

    const hasFilters = search || Object.keys(directFilters).length;
    const finalWhere = hasFilters ? { ...searchConditions, ...directFilters } : undefined;

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.academicLoadsService.findAll(Number(page), Number(limit), finalWhere as any, parsedOrderBy);
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

  // Bulk import endpoint for academic loads
  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import academic loads from Excel data' })
  @ApiResponse({ status: 201, description: 'Academic loads successfully imported' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @AuthorizedEndpoint(PermissionType.CREATE)
  async bulkImportAcademicLoads(@Body() importDto: BulkImportAcademicLoadsDto) {
    this.logger.debug(`Bulk importing ${importDto.loads.length} academic loads`);
    return this.academicLoadsService.bulkImportAcademicLoads(importDto.loads);
  }
}
