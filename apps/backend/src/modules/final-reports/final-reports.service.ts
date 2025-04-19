import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReport } from '@una-gc/database/prisma/generated/client';
import { FinalReportsRepository } from './final-reports.repository';

@Injectable()
export class FinalReportsService extends GenericService<FinalReport, FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsService.name);

  constructor(
    protected readonly finalReportsRepository: FinalReportsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(finalReportsRepository, FinalReportDto);
  }
}
