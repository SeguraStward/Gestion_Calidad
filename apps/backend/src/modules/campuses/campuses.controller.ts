import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';
import { CampusDto } from './dtos/campus.dto';
import { CampusesService } from './campuses.service';

@Controller('campuses')
export class CampusesController extends GenericController<CampusDto, CampusDto> {
  protected readonly logger = new Logger(CampusesController.name);
  constructor(private readonly campusesService: CampusesService) {
    super(campusesService);
  }
}
