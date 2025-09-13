import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProofDocumentTypeDto } from './dtos/proof-document-type.dto';
import { CreateProofDocumentTypeDto } from './dtos/create-proof-document-type.dto';
import { UpdateProofDocumentTypeDto } from './dtos/update-proof-document-type.dto';
import { ProofDocumentTypesService } from './proof-document-types.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('PROOF_DOCUMENT_TYPE')
@Controller('proof-document-types')
export class ProofDocumentTypesController extends GenericController<ProofDocumentTypeDto, CreateProofDocumentTypeDto, UpdateProofDocumentTypeDto> {
  protected readonly logger = new Logger(ProofDocumentTypesController.name);
  protected readonly resourceName = 'PROOF_DOCUMENT_TYPE';

  constructor(private readonly proofDocumentTypesService: ProofDocumentTypesService) {
    super(proofDocumentTypesService);
  }
}
