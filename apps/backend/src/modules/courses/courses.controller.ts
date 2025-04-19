import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController extends GenericController<CourseDto, CourseDto> {
  protected readonly logger = new Logger(CoursesController.name);
  constructor(private readonly coursesService: CoursesService) {
    super(coursesService);
  }
}
