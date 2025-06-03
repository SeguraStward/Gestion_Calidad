import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CommMemberDto } from './dtos/comm-member.dto';
import { CommMembersService } from './comm-members.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('COMM_MEMBER')
@Controller('comm-members')
export class CommMembersController extends GenericController<CommMemberDto, CommMemberDto> {
  protected readonly logger = new Logger(CommMembersController.name);
  protected readonly resourceName = 'COMM_MEMBER';
  constructor(private readonly commMembersService: CommMembersService) {
    super(commMembersService);
  }
}
