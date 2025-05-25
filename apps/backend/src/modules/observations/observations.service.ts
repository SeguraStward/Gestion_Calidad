import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ObservationDto } from './dtos/observation.dto';
import { Observation } from '@una-gc/database/prisma/generated/client';
import { ObservationsRepository } from './observations.repository';

@Injectable()
export class ObservationsService extends GenericService<Observation, ObservationDto, ObservationDto> {
  protected readonly logger = new Logger(ObservationsService.name);

  constructor(
    protected readonly observationsRepository: ObservationsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(observationsRepository, ObservationDto);
  }
}
