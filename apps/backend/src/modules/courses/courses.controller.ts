import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Post, Body, HttpStatus } from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { CoursesService } from './courses.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
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
