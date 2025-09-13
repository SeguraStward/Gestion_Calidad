import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProofDocumentTypeDto } from './dtos/proof-document-type.dto';
import { CreateProofDocumentTypeDto } from './dtos/create-proof-document-type.dto';
import { UpdateProofDocumentTypeDto } from './dtos/update-proof-document-type.dto';
import { ProofDocumentType } from '@una-gc/database/prisma/generated/client';
import { ProofDocumentTypesRepository } from './proof-document-types.repository';

@Injectable()
export class ProofDocumentTypesService extends GenericService<ProofDocumentType, ProofDocumentTypeDto, CreateProofDocumentTypeDto, UpdateProofDocumentTypeDto> {
  protected readonly logger = new Logger(ProofDocumentTypesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['proofDocuments', 'documentCounter'],
    errorMessage: 'Cannot delete Proof Document Type because it has associated proof documents or document counter.',
  };

  constructor(
    protected readonly proofDocumentTypesRepository: ProofDocumentTypesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(proofDocumentTypesRepository, ProofDocumentTypeDto);
  }
}
