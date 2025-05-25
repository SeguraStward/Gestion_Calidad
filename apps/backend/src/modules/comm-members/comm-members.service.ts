import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CommMemberDto } from './dtos/comm-member.dto';
import { CommMember } from '@una-gc/database/prisma/generated/client';
import { CommMembersRepository } from './comm-members.repository';

@Injectable()
export class CommMembersService extends GenericService<CommMember, CommMemberDto, CommMemberDto> {
  protected readonly logger = new Logger(CommMembersService.name);

  constructor(
    protected readonly commMembersRepository: CommMembersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(commMembersRepository, CommMemberDto);
  }
}
