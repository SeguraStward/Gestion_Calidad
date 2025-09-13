import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class GoogleDriveFolderDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Google Drive Folder ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Folder name in Google Drive' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Google Drive folder ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  googleFolderId: string;

  @ApiPropertyOptional({ description: 'Parent folder ID in our system' })
  @Expose()
  @IsString()
  @IsOptional()
  parentFolderId?: string;

  @ApiProperty({ description: 'Folder level (1=Dimension, 2=Component, 3=Criterion, 4=Standard, 5=Evidence)' })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @ApiProperty({ description: 'Entity type (dimension, component, criterion, standard, evidence)' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiPropertyOptional({ description: 'Reference to the actual entity' })
  @Expose()
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Career code for career-specific folders' })
  @Expose()
  @IsString()
  @IsOptional()
  careerCode?: string;

  @ApiProperty({ description: 'Full path in Google Drive' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ enum: Status, description: 'Folder status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => GoogleDriveFolderDto, description: 'Parent folder' })
  @Expose()
  @Type(() => GoogleDriveFolderDto)
  @IsOptional()
  parentFolder?: GoogleDriveFolderDto;

  @ApiPropertyOptional({ type: () => [GoogleDriveFolderDto], description: 'Child folders' })
  @Expose()
  @Type(() => GoogleDriveFolderDto)
  @IsOptional()
  childFolders?: GoogleDriveFolderDto[];
}
