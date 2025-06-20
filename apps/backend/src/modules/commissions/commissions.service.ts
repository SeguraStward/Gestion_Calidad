import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CommissionDto } from './dtos/commission.dto';
import { Commission } from '@una-gc/database/prisma/generated/client';
import { CommissionsRepository } from './commissions.repository';

@Injectable()
export class CommissionsService extends GenericService<Commission, CommissionDto, CommissionDto> {
  protected readonly logger = new Logger(CommissionsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['projects', 'reviews', 'sessions', 'members'],
    errorMessage: 'Cannot delete Commission because it has associated: projects, reviews, sessions, members.',
  };

  constructor(
    protected readonly commissionsRepository: CommissionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(commissionsRepository, CommissionDto);
  }
}
