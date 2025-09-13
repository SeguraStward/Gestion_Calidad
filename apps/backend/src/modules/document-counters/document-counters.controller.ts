import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { DocumentCounterDto } from './dtos/document-counter.dto';
import { CreateDocumentCounterDto } from './dtos/create-document-counter.dto';
import { UpdateDocumentCounterDto } from './dtos/update-document-counter.dto';
import { DocumentCountersService } from './document-counters.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('DOCUMENT_COUNTER')
@Controller('document-counters')
export class DocumentCountersController extends GenericController<DocumentCounterDto, CreateDocumentCounterDto, UpdateDocumentCounterDto> {
  protected readonly logger = new Logger(DocumentCountersController.name);
  protected readonly resourceName = 'DOCUMENT_COUNTER';

  constructor(private readonly documentCountersService: DocumentCountersService) {
    super(documentCountersService);
  }
}
