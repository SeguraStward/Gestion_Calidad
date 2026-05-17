import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { QualityEvidenceDto } from '@src/modules/quality-evidences/dtos/quality-evidence.dto';
import { ProofDocumentTypeDto } from '@src/modules/proof-document-types/dtos/proof-document-type.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class ProofDocumentDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Proof Document ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Auto-generated document code (e.g., CONV-001)' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Document name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Google Drive public URL' })
  @Expose()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'Original file name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'File type (e.g., pdf, docx, xlsx)' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @Expose()
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ description: 'Quality Evidence ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  evidenceId: string;

  @ApiProperty({ description: 'Proof Document Type ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  proofDocumentTypeId: string;

  @ApiPropertyOptional({ description: 'Google Drive file ID' })
  @Expose()
  @IsString()
  @IsOptional()
  googleDriveFileId?: string;

  @ApiPropertyOptional({ description: 'Google Drive parent folder ID (evidence folder)' })
  @Expose()
  @IsString()
  @IsOptional()
  googleDriveFolderId?: string;

  @ApiPropertyOptional({ description: 'Google Drive folder ID for the document type' })
  @Expose()
  @IsString()
  @IsOptional()
  googleDriveTypeFolderId?: string;

  @ApiPropertyOptional({ description: 'Google Drive folder ID for this specific upload' })
  @Expose()
  @IsString()
  @IsOptional()
  googleDriveUploadFolderId?: string;

  @ApiPropertyOptional({ description: 'Google Drive version for tracking updates' })
  @Expose()
  @IsString()
  @IsOptional()
  googleDriveVersion?: string;

  @ApiProperty({ enum: Status, description: 'Document status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => QualityEvidenceDto, description: 'Associated quality evidence' })
  @Expose()
  @Type(() => QualityEvidenceDto)
  @IsOptional()
  evidence?: QualityEvidenceDto;

  @ApiPropertyOptional({ type: () => ProofDocumentTypeDto, description: 'Associated proof document type' })
  @Expose()
  @Type(() => ProofDocumentTypeDto)
  @IsOptional()
  proofDocumentType?: ProofDocumentTypeDto;

  @ApiPropertyOptional({ description: 'Associated career proof documents', type: 'array' })
  @Expose()
  @IsOptional()
  careerProofDocuments?: any[];
}
