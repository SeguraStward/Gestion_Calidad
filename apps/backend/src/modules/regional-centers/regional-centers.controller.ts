import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCentersService } from './regional-centers.service';

@Controller('regional-centers')
export class RegionalCentersController extends GenericController<RegionalCenterDto, RegionalCenterDto> {
  protected readonly logger = new Logger(RegionalCentersController.name);
  constructor(private readonly regionalCentersService: RegionalCentersService) {
    super(regionalCentersService);
  }
}
