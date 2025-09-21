import { Controller, Logger } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';

import { AnnualJourneyTimeAllocationsService } from './annual-journey-time-allocations.service';
import { AnnualAllocationDto } from './dtos/annual-allocation.dto';
import { CreateAnnualAllocationDto } from './dtos/create-annual-allocation.dto';
import { UpdateAnnualAllocationDto } from './dtos/update-annual-allocation.dto';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('ANNUAL_ALLOCATION')
@Controller('annual-journey-time-allocations')
export class AnnualJourneyTimeAllocationsController extends GenericController<
  AnnualAllocationDto,
  CreateAnnualAllocationDto,
  UpdateAnnualAllocationDto
> {
  protected readonly logger = new Logger(AnnualJourneyTimeAllocationsController.name);
  protected readonly resourceName = 'ANNUAL_ALLOCATION';

  constructor(private readonly serviceImpl: AnnualJourneyTimeAllocationsService) {
    super(serviceImpl);
  }
}
