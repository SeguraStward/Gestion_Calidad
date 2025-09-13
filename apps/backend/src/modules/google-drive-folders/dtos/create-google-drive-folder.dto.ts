import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateGoogleDriveFolderDto {
  @ApiProperty({ description: 'Folder name in Google Drive' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Google Drive folder ID' })
  @IsString()
  @IsNotEmpty()
  googleFolderId: string;

  @ApiPropertyOptional({ description: 'Parent folder ID in our system' })
  @IsString()
  @IsOptional()
  parentFolderId?: string;

  @ApiProperty({ description: 'Folder level (1=Dimension, 2=Component, 3=Criterion, 4=Standard, 5=Evidence)' })
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @ApiProperty({ description: 'Entity type (dimension, component, criterion, standard, evidence)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiPropertyOptional({ description: 'Reference to the actual entity' })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Career code for career-specific folders' })
  @IsString()
  @IsOptional()
  careerCode?: string;

  @ApiProperty({ description: 'Full path in Google Drive' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ enum: Status, description: 'Folder status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
