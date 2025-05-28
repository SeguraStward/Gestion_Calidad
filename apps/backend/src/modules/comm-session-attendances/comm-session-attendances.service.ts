import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CommSessionAttendanceDto } from './dtos/comm-session-attendance.dto';
import { CommSessionAttendance } from '@una-gc/database/prisma/generated/client';
import { CommSessionAttendancesRepository } from './comm-session-attendances.repository';

@Injectable()
export class CommSessionAttendancesService extends GenericService<
  CommSessionAttendance,
  CommSessionAttendanceDto,
  CommSessionAttendanceDto
> {
  protected readonly logger = new Logger(CommSessionAttendancesService.name);

  constructor(
    protected readonly commSessionAttendancesRepository: CommSessionAttendancesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(commSessionAttendancesRepository, CommSessionAttendanceDto);
  }
}
