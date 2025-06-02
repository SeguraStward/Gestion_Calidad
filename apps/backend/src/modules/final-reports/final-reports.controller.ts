import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsService } from './final-reports.service';

@Controller('final-reports')
export class FinalReportsController extends GenericController<FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsController.name);
  protected readonly resourceName = 'FINAL_REPORT';
  constructor(private readonly finalReportsService: FinalReportsService) {
    super(finalReportsService);
  }
}
