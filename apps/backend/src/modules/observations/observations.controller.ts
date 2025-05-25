import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ObservationDto } from './dtos/observation.dto';
import { ObservationsService } from './observations.service';

@Controller('observations')
export class ObservationsController extends GenericController<ObservationDto, ObservationDto> {
  protected readonly logger = new Logger(ObservationsController.name);
  constructor(private readonly observationsService: ObservationsService) {
    super(observationsService);
  }
}
