import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class ProofDocumentTypeDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Proof Document Type ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Proof Document Type code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Proof Document Type name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Proof Document Type description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Prefix for generating document codes' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  prefix: string;

  @ApiProperty({ enum: Status, description: 'Proof Document Type status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ description: 'Associated proof documents', type: 'array' })
  @Expose()
  @IsOptional()
  proofDocuments?: any[];

  @ApiPropertyOptional({ description: 'Associated document counter' })
  @Expose()
  @IsOptional()
  documentCounter?: any;
}
