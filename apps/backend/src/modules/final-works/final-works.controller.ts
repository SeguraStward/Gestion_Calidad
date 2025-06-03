import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { FinalWorkDto } from './dtos/final-work.dto';
import { FinalWorksService } from './final-works.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('FINAL_WORK')
@Controller('final-works')
export class FinalWorksController extends GenericController<FinalWorkDto, FinalWorkDto> {
  protected readonly logger = new Logger(FinalWorksController.name);
  protected readonly resourceName = 'FINAL_WORK';
  constructor(private readonly finalWorksService: FinalWorksService) {
    super(finalWorksService);
  }
}
