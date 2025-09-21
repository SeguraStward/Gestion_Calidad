import { Controller, Logger } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';

import { CampusJourneyTimeAllocationsService } from './campus-journey-time-allocations.service';
import { CampusAllocationDto } from './dtos/campus-allocation.dto';
import { CreateCampusAllocationDto } from './dtos/create-campus-allocation.dto';
import { UpdateCampusAllocationDto } from './dtos/update-campus-allocation.dto';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('CAMPUS_ALLOCATION')
@Controller('campus-journey-time-allocations')
export class CampusJourneyTimeAllocationsController extends GenericController<
  CampusAllocationDto,
  CreateCampusAllocationDto,
  UpdateCampusAllocationDto
> {
  protected readonly logger = new Logger(CampusJourneyTimeAllocationsController.name);
  protected readonly resourceName = 'CAMPUS_ALLOCATION';

  constructor(private readonly serviceImpl: CampusJourneyTimeAllocationsService) {
    super(serviceImpl);
  }
}
