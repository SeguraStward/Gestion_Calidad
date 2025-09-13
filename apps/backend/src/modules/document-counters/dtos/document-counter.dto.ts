import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { ProofDocumentTypeDto } from '@src/modules/proof-document-types/dtos/proof-document-type.dto';

export class DocumentCounterDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Document Counter ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Proof Document Type ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  proofDocumentTypeId: string;

  @ApiProperty({ description: 'Last number used', default: 0 })
  @Expose()
  @IsNumber()
  @IsOptional()
  lastNumber?: number;

  @ApiPropertyOptional({ type: () => ProofDocumentTypeDto, description: 'Associated proof document type' })
  @Expose()
  @Type(() => ProofDocumentTypeDto)
  @IsOptional()
  proofDocumentType?: ProofDocumentTypeDto;
}
