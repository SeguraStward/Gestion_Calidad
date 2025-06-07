import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CampusDto } from './dtos/campus.dto';
import { CampusesService } from './campuses.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('FINAL_REPORT')
@Controller('campuses')
export class CampusesController extends GenericController<CampusDto, CampusDto> {
  protected readonly logger = new Logger(CampusesController.name);
  protected readonly resourceName = 'CAMPUS';
  constructor(private readonly campusesService: CampusesService) {
    super(campusesService);
  }
}
