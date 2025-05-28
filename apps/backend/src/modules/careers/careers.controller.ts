import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CareerDto } from './dtos/career.dto';
import { CareersService } from './careers.service';

@Controller('careers')
export class CareersController extends GenericController<CareerDto, CareerDto> {
  protected readonly logger = new Logger(CareersController.name);
  constructor(private readonly careersService: CareersService) {
    super(careersService);
  }
}
