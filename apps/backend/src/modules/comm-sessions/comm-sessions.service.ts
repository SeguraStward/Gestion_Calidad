import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CommSessionDto } from './dtos/comm-session.dto';
import { CommSession } from '@una-gc/database/prisma/generated/client';
import { CommSessionsRepository } from './comm-sessions.repository';

@Injectable()
export class CommSessionsService extends GenericService<CommSession, CommSessionDto, CommSessionDto> {
  protected readonly logger = new Logger(CommSessionsService.name);

  constructor(
    protected readonly commSessionsRepository: CommSessionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(commSessionsRepository, CommSessionDto);
  }
}
