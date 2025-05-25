import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { DocumentDto } from './dtos/document.dto';
import { Document } from '@una-gc/database/prisma/generated/client';
import { DocumentsRepository } from './documents.repository';

@Injectable()
export class DocumentsService extends GenericService<Document, DocumentDto, DocumentDto> {
  protected readonly logger = new Logger(DocumentsService.name);

  constructor(
    protected readonly documentsRepository: DocumentsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(documentsRepository, DocumentDto);
  }
}
