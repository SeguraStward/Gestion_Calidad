import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ScheduleDto } from './dtos/schedule.dto';
import { Schedule } from '@una-gc/database/prisma/generated/client';
import { SchedulesRepository } from './schedules.repository';

@Injectable()
export class SchedulesService extends GenericService<Schedule, ScheduleDto, ScheduleDto> {
  protected readonly logger = new Logger(SchedulesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['academicLoads'],
    errorMessage: 'Cannot delete Schedule because it has associated: academicLoads.',
  };

  constructor(
    protected readonly schedulesRepository: SchedulesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(schedulesRepository, ScheduleDto);
  }
}
