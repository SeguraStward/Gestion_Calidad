import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { StandardDto } from './dtos/standard.dto';
import { CreateStandardDto } from './dtos/create-standard.dto';
import { UpdateStandardDto } from './dtos/update-standard.dto';
import { StandardsService } from './standards.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('STANDARD')
@Controller('standards')
export class StandardsController extends GenericController<StandardDto, CreateStandardDto, UpdateStandardDto> {
  protected readonly logger = new Logger(StandardsController.name);
  protected readonly resourceName = 'STANDARD';

  constructor(private readonly standardsService: StandardsService) {
    super(standardsService);
  }
}
