import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CommSessionDto } from './dtos/comm-session.dto';
import { CommSessionsService } from './comm-sessions.service';

@Controller('comm-sessions')
export class CommSessionsController extends GenericController<CommSessionDto, CommSessionDto> {
  protected readonly logger = new Logger(CommSessionsController.name);
  protected readonly resourceName = 'COMM_SESSION';
  constructor(private readonly commSessionsService: CommSessionsService) {
    super(commSessionsService);
  }
}
