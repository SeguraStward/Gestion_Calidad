import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { IntellectualProductionDto } from './dtos/intellectual-production.dto';
import { IntellectualProductionsService } from './intellectual-productions.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('INTELLECTUAL_PRODUCTION')
@Controller('intellectual-productions')
export class IntellectualProductionsController extends GenericController<
  IntellectualProductionDto,
  IntellectualProductionDto
> {
  protected readonly logger = new Logger(IntellectualProductionsController.name);
  protected readonly resourceName = 'INTELLECTUAL_PRODUCTION';
  constructor(private readonly intellectualProductionsService: IntellectualProductionsService) {
    super(intellectualProductionsService);
  }
}
