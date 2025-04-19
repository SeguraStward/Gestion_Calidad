import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger } from '@nestjs/common';
import { ClassroomDto } from './dtos/classroom.dto';
import { Classroom } from '@una-gc/database/prisma/generated/client';
import { DtoValidator } from '@core/common/dto-validator';
import { ClassroomsRepository } from './classrooms.repository';

@Injectable()
export class ClassroomsService extends GenericService<Classroom, ClassroomDto, ClassroomDto> {
  protected readonly logger = new Logger(ClassroomsService.name);

  constructor(
    protected readonly classroomsRepository: ClassroomsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(classroomsRepository, ClassroomDto);
  }
}
