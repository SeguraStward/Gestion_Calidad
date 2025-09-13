import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CriterionDto } from './dtos/criterion.dto';
import { CreateCriterionDto } from './dtos/create-criterion.dto';
import { UpdateCriterionDto } from './dtos/update-criterion.dto';
import { CriteriaService } from './criteria.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('CRITERION')
@Controller('criteria')
export class CriteriaController extends GenericController<CriterionDto, CreateCriterionDto, UpdateCriterionDto> {
  protected readonly logger = new Logger(CriteriaController.name);
  protected readonly resourceName = 'CRITERION';

  constructor(private readonly criteriaService: CriteriaService) {
    super(criteriaService);
  }
}
