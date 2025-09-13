import { PartialType } from '@nestjs/swagger';
import { CreateStandardEvidenceDto } from './create-standard-evidence.dto';

export class UpdateStandardEvidenceDto extends PartialType(CreateStandardEvidenceDto) { }
