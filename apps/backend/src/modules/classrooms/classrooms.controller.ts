import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ClassroomDto } from './dtos/classroom.dto';
import { ClassroomsService } from './classrooms.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('CLASSROOM')
@Controller('classrooms')
export class ClassroomsController extends GenericController<ClassroomDto, ClassroomDto> {
  protected readonly logger = new Logger(ClassroomsController.name);
  protected readonly resourceName = 'CLASSROOM';
  constructor(private readonly classroomsService: ClassroomsService) {
    super(classroomsService);
  }
}
