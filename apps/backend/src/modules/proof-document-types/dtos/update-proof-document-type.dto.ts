import { PartialType } from '@nestjs/swagger';
import { CreateProofDocumentTypeDto } from './create-proof-document-type.dto';

export class UpdateProofDocumentTypeDto extends PartialType(CreateProofDocumentTypeDto) { }
