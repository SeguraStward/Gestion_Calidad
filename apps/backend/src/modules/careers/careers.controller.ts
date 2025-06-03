import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CareerDto } from './dtos/career.dto';
import { CareersService } from './careers.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('CAREER')
@Controller('careers')
export class CareersController extends GenericController<CareerDto, CareerDto> {
  protected readonly logger = new Logger(CareersController.name);
  protected readonly resourceName = 'CAREER';
  constructor(private readonly careersService: CareersService) {
    super(careersService);
  }
}
