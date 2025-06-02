import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CommissionDto } from './dtos/commission.dto';
import { CommissionsService } from './commissions.service';

@Controller('commissions')
export class CommissionsController extends GenericController<CommissionDto, CommissionDto> {
  protected readonly logger = new Logger(CommissionsController.name);
  protected readonly resourceName = 'COMMISSION';
  constructor(private readonly commissionsService: CommissionsService) {
    super(commissionsService);
  }
}
