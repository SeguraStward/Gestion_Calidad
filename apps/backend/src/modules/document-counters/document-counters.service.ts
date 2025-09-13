import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { DocumentCounterDto } from './dtos/document-counter.dto';
import { CreateDocumentCounterDto } from './dtos/create-document-counter.dto';
import { UpdateDocumentCounterDto } from './dtos/update-document-counter.dto';
import { DocumentCounter } from '@una-gc/database/prisma/generated/client';
import { DocumentCountersRepository } from './document-counters.repository';

@Injectable()
export class DocumentCountersService extends GenericService<DocumentCounter, DocumentCounterDto, CreateDocumentCounterDto, UpdateDocumentCounterDto> {
  protected readonly logger = new Logger(DocumentCountersService.name);

  protected readonly relationCheckConfig = {
    relationFields: [],
    errorMessage: 'Cannot delete Document Counter.',
  };

  constructor(
    protected readonly documentCountersRepository: DocumentCountersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(documentCountersRepository, DocumentCounterDto);
  }
}
