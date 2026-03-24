import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { CoursesService } from './courses.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BulkImportCoursesDto, BulkImportCoursesResultDto } from './dtos/bulk-import-courses.dto';
import { AuthorizedEndpoint } from '@core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ResourceName('COURSE')
@Controller('courses')
export class CoursesController extends GenericController<CourseDto, CourseDto> {
  protected readonly logger = new Logger(CoursesController.name);
  protected readonly resourceName = 'COURSE';
  constructor(private readonly coursesService: CoursesService) {
    super(coursesService);
  }

  @Get()
  @ApiOperation({ summary: 'Find all courses with optional search by code or name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by code or name' })
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
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const finalWhere =
      Object.keys(filters).length || search ? { ...searchConditions, ...filters } : undefined;
    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;

    return this.coursesService.findAll(Number(page), Number(limit), finalWhere, parsedOrderBy);
  }

  /**
   * Bulk import courses from Excel
   */
  @Post('/bulk-import')
  @AuthorizedEndpoint(PermissionType.CREATE)
  @ApiOperation({ summary: 'Bulk import courses from Excel file' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Courses imported successfully',
    type: BulkImportCoursesResultDto,
  })
  async bulkImportCourses(@Body() importDto: BulkImportCoursesDto) {
    this.logger.log(`Bulk importing ${importDto.courses.length} courses`);
    return this.coursesService.bulkImportCourses(importDto.courses);
  }
}
