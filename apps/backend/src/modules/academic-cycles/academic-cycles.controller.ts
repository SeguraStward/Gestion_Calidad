import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { AcademicCycleDto } from './dtos/academic-cycle.dto';
import { AcademicCyclesService } from './academic-cycles.service';

@Controller('academic-cycles')
export class AcademicCyclesController extends GenericController<AcademicCycleDto, AcademicCycleDto> {
  protected readonly logger = new Logger(AcademicCyclesController.name);
  constructor(private readonly academicCyclesService: AcademicCyclesService) {
    super(academicCyclesService);
  }
}
