import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { Course } from '@una-gc/database/prisma/generated/client';
import { CoursesRepository } from './courses.repository';

@Injectable()
export class CoursesService extends GenericService<Course, CourseDto, CourseDto> {
  protected readonly logger = new Logger(CoursesService.name);

  constructor(
    protected readonly coursesRepository: CoursesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(coursesRepository, CourseDto);
  }
}
