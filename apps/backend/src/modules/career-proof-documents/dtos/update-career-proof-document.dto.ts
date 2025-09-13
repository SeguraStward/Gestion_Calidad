import { PartialType } from '@nestjs/swagger';
import { CreateCareerProofDocumentDto } from './create-career-proof-document.dto';

export class UpdateCareerProofDocumentDto extends PartialType(CreateCareerProofDocumentDto) { }
