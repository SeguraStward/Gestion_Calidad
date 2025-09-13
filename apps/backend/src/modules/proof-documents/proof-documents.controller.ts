import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocumentsService } from './proof-documents.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('PROOF_DOCUMENT')
@Controller('proof-documents')
export class ProofDocumentsController extends GenericController<ProofDocumentDto, CreateProofDocumentDto, UpdateProofDocumentDto> {
  protected readonly logger = new Logger(ProofDocumentsController.name);
  protected readonly resourceName = 'PROOF_DOCUMENT';

  constructor(private readonly proofDocumentsService: ProofDocumentsService) {
    super(proofDocumentsService);
  }
}
