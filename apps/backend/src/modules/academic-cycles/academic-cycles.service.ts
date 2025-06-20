import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { AcademicCycleDto } from './dtos/academic-cycle.dto';
import { AcademicCycle } from '@una-gc/database/prisma/generated/client';
import { AcademicCyclesRepository } from './academic-cycles.repository';

@Injectable()
export class AcademicCyclesService extends GenericService<AcademicCycle, AcademicCycleDto, AcademicCycleDto> {
  protected readonly logger = new Logger(AcademicCyclesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['academicLoads', 'projects'],
    errorMessage: 'Cannot delete AcademicCycle because it has associated: academicLoads, projects.',
  };

  constructor(
    protected readonly academicCyclesRepository: AcademicCyclesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicCyclesRepository, AcademicCycleDto);
  }
}
