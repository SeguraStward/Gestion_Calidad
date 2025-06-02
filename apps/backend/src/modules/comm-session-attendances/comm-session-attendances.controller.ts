import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CommSessionAttendanceDto } from './dtos/comm-session-attendance.dto';
import { CommSessionAttendancesService } from './comm-session-attendances.service';

@Controller('comm-session-attendances')
export class CommSessionAttendancesController extends GenericController<
  CommSessionAttendanceDto,
  CommSessionAttendanceDto
> {
  protected readonly logger = new Logger(CommSessionAttendancesController.name);
  protected readonly resourceName = 'COMM_SESSION_ATTENDANCE';
  constructor(private readonly commSessionAttendancesService: CommSessionAttendancesService) {
    super(commSessionAttendancesService);
  }
}
