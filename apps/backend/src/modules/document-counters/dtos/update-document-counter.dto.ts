import { PartialType } from '@nestjs/swagger';
import { CreateDocumentCounterDto } from './create-document-counter.dto';

export class UpdateDocumentCounterDto extends PartialType(CreateDocumentCounterDto) { }
