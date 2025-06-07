import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { CoursesService } from './courses.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('FINAL_REPORT')
@Controller('courses')
export class CoursesController extends GenericController<CourseDto, CourseDto> {
  protected readonly logger = new Logger(CoursesController.name);
  protected readonly resourceName = 'COURSE';
  constructor(private readonly coursesService: CoursesService) {
    super(coursesService);
  }
}
