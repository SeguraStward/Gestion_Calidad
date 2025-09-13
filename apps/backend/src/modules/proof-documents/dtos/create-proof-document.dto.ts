import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateProofDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Google Drive public URL' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'File type (e.g., pdf, docx, xlsx)' })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ description: 'Quality Evidence ID' })
  @IsString()
  @IsNotEmpty()
  evidenceId: string;

  @ApiProperty({ description: 'Proof Document Type ID' })
  @IsString()
  @IsNotEmpty()
  proofDocumentTypeId: string;

  @ApiPropertyOptional({ description: 'Google Drive file ID' })
  @IsString()
  @IsOptional()
  googleDriveFileId?: string;

  @ApiPropertyOptional({ description: 'Google Drive parent folder ID' })
  @IsString()
  @IsOptional()
  googleDriveFolderId?: string;

  @ApiPropertyOptional({ description: 'Google Drive version for tracking updates' })
  @IsString()
  @IsOptional()
  googleDriveVersion?: string;

  @ApiProperty({ enum: Status, description: 'Document status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
