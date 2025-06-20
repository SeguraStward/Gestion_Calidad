import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { DocumentDto } from './dtos/document.dto';
import { DocumentsService } from './documents.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('DOCUMENT')
@Controller('documents')
export class DocumentsController extends GenericController<DocumentDto, DocumentDto> {
  protected readonly logger = new Logger(DocumentsController.name);
  protected readonly resourceName = 'DOCUMENT';
  constructor(private readonly documentsService: DocumentsService) {
    super(documentsService);
  }
}
