import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CriterionDto } from './dtos/criterion.dto';
import { CreateCriterionDto } from './dtos/create-criterion.dto';
import { UpdateCriterionDto } from './dtos/update-criterion.dto';
import { Criterion } from '@una-gc/database/prisma/generated/client';
import { CriteriaRepository } from './criteria.repository';

@Injectable()
export class CriteriaService extends GenericService<Criterion, CriterionDto, CreateCriterionDto, UpdateCriterionDto> {
  protected readonly logger = new Logger(CriteriaService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['standards', 'evidences'],
    errorMessage: 'Cannot delete Criterion because it has associated standards or evidences.',
  };

  constructor(
    protected readonly criteriaRepository: CriteriaRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(criteriaRepository, CriterionDto);
  }
}
