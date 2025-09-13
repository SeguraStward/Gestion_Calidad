import { PartialType } from '@nestjs/swagger';
import { CreateProofDocumentDto } from './create-proof-document.dto';

export class UpdateProofDocumentDto extends PartialType(CreateProofDocumentDto) { }
