import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { StandardDto } from '@src/modules/standards/dtos/standard.dto';
import { CriterionDto } from '@src/modules/criteria/dtos/criterion.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class QualityEvidenceDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Quality Evidence ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Quality Evidence code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Quality Evidence name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Quality Evidence description' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Display order' })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiPropertyOptional({ description: 'Standard ID' })
  @Expose()
  @IsString()
  @IsOptional()
  standardId?: string;

  @ApiPropertyOptional({ description: 'Criterion ID' })
  @Expose()
  @IsString()
  @IsOptional()
  criterionId?: string;

  @ApiProperty({ enum: Status, description: 'Quality Evidence status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => StandardDto, description: 'Associated standard' })
  @Expose()
  @Type(() => StandardDto)
  @IsOptional()
  standard?: StandardDto;

  @ApiPropertyOptional({ type: () => CriterionDto, description: 'Associated criterion' })
  @Expose()
  @Type(() => CriterionDto)
  @IsOptional()
  criterion?: CriterionDto;

  @ApiPropertyOptional({ description: 'Associated proof documents', type: 'array' })
  @Expose()
  @IsOptional()
  proofDocuments?: any[];

  @ApiPropertyOptional({ description: 'Associated standard evidences', type: 'array' })
  @Expose()
  @IsOptional()
  standardEvidences?: any[];
}
