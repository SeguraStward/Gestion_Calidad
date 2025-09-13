import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { ProofDocumentDto } from '@src/modules/proof-documents/dtos/proof-document.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CareerProofDocumentDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Career Proof Document ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Career ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  careerId: string;

  @ApiProperty({ description: 'Proof Document ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  proofDocumentId: string;

  @ApiProperty({ enum: Status, description: 'Career Proof Document status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ description: 'Associated career' })
  @Expose()
  @IsOptional()
  career?: any; // CareerDto cuando esté disponible

  @ApiPropertyOptional({ type: () => ProofDocumentDto, description: 'Associated proof document' })
  @Expose()
  @Type(() => ProofDocumentDto)
  @IsOptional()
  proofDocument?: ProofDocumentDto;
}
