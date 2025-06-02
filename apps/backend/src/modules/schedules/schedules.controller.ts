import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ScheduleDto } from './dtos/schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController extends GenericController<ScheduleDto, ScheduleDto> {
  protected readonly logger = new Logger(SchedulesController.name);
  protected readonly resourceName = 'SCHEDULE';
  constructor(private readonly schedulesService: SchedulesService) {
    super(schedulesService);
  }
}
