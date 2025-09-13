import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { StandardDto } from '@src/modules/standards/dtos/standard.dto';
import { QualityEvidenceDto } from '@src/modules/quality-evidences/dtos/quality-evidence.dto';

export class StandardEvidenceDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Standard Evidence ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Standard ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  standardId: string;

  @ApiProperty({ description: 'Evidence ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  evidenceId: string;

  @ApiPropertyOptional({ type: () => StandardDto, description: 'Associated standard' })
  @Expose()
  @Type(() => StandardDto)
  @IsOptional()
  standard?: StandardDto;

  @ApiPropertyOptional({ type: () => QualityEvidenceDto, description: 'Associated evidence' })
  @Expose()
  @Type(() => QualityEvidenceDto)
  @IsOptional()
  evidence?: QualityEvidenceDto;
}
