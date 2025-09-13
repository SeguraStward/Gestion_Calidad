import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { StandardEvidenceDto } from './dtos/standard-evidence.dto';
import { CreateStandardEvidenceDto } from './dtos/create-standard-evidence.dto';
import { UpdateStandardEvidenceDto } from './dtos/update-standard-evidence.dto';
import { StandardEvidencesService } from './standard-evidences.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('STANDARD_EVIDENCE')
@Controller('standard-evidences')
export class StandardEvidencesController extends GenericController<StandardEvidenceDto, CreateStandardEvidenceDto, UpdateStandardEvidenceDto> {
  protected readonly logger = new Logger(StandardEvidencesController.name);
  protected readonly resourceName = 'STANDARD_EVIDENCE';

  constructor(private readonly standardEvidencesService: StandardEvidencesService) {
    super(standardEvidencesService);
  }
}
