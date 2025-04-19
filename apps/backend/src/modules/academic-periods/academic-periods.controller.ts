import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';
import { AcademicPeriodDto } from './dtos/academic-period.dto';
import { AcademicPeriodsService } from './academic-periods.service';

@Controller('academic-periods')
export class AcademicPeriodsController extends GenericController<AcademicPeriodDto, AcademicPeriodDto> {
  protected readonly logger = new Logger(AcademicPeriodsController.name);
  constructor(private readonly academicPeriodsService: AcademicPeriodsService) {
    super(academicPeriodsService);
  }
}
