import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { AcademicPeriodDto } from './dtos/academic-period.dto';
import { AcademicPeriod } from '@una-gc/database/prisma/generated/client';
import { AcademicPeriodsRepository } from './academic-periods.repository';

@Injectable()
export class AcademicPeriodsService extends GenericService<
  AcademicPeriod,
  AcademicPeriodDto,
  AcademicPeriodDto
> {
  protected readonly logger = new Logger(AcademicPeriodsService.name);

  constructor(
    protected readonly academicPeriodsRepository: AcademicPeriodsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicPeriodsRepository, AcademicPeriodDto);
  }
}
