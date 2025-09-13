import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { StandardEvidenceDto } from './dtos/standard-evidence.dto';
import { CreateStandardEvidenceDto } from './dtos/create-standard-evidence.dto';
import { UpdateStandardEvidenceDto } from './dtos/update-standard-evidence.dto';
import { StandardEvidence } from '@una-gc/database/prisma/generated/client';
import { StandardEvidencesRepository } from './standard-evidences.repository';

@Injectable()
export class StandardEvidencesService extends GenericService<StandardEvidence, StandardEvidenceDto, CreateStandardEvidenceDto, UpdateStandardEvidenceDto> {
  protected readonly logger = new Logger(StandardEvidencesService.name);

  protected readonly relationCheckConfig = {
    relationFields: [],
    errorMessage: 'Cannot delete Standard Evidence.',
  };

  constructor(
    protected readonly standardEvidencesRepository: StandardEvidencesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(standardEvidencesRepository, StandardEvidenceDto);
  }
}
