import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { QualityEvidenceDto } from './dtos/quality-evidence.dto';
import { CreateQualityEvidenceDto } from './dtos/create-quality-evidence.dto';
import { UpdateQualityEvidenceDto } from './dtos/update-quality-evidence.dto';
import { QualityEvidencesService } from './quality-evidences.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('QUALITY_EVIDENCE')
@Controller('quality-evidences')
export class QualityEvidencesController extends GenericController<QualityEvidenceDto, CreateQualityEvidenceDto, UpdateQualityEvidenceDto> {
  protected readonly logger = new Logger(QualityEvidencesController.name);
  protected readonly resourceName = 'QUALITY_EVIDENCE';

  constructor(private readonly qualityEvidencesService: QualityEvidencesService) {
    super(qualityEvidencesService);
  }
}
