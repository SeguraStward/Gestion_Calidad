import { PartialType } from '@nestjs/swagger';
import { CreateQualityEvidenceDto } from './create-quality-evidence.dto';

export class UpdateQualityEvidenceDto extends PartialType(CreateQualityEvidenceDto) { }
