import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, IsNotEmpty, IsMongoId } from 'class-validator';

import { ProjectStatus, Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class ProjectDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Project ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Student IDs', type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  studentIds: string[];

  @ApiProperty({ description: 'Academic Cycle ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  academicCycleId: string;

  @ApiProperty({ description: 'Commission ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  commissionId: string;

  @ApiProperty({ description: 'Regional Center ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  regionalCenterId: string;

  @ApiProperty({ description: 'Career ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  careerId: string;

  @ApiProperty({ description: 'Tutor ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'Internal Reader ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  internalReaderId: string;

  @ApiProperty({ description: 'External Reader ID' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  externalReaderId: string;

  @ApiProperty({ description: 'Project Type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Project Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Project Modality' })
  @IsString()
  @IsNotEmpty()
  modality: string;

  @ApiProperty({ description: 'Project URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Project Status' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  projectStatus?: ProjectStatus;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE, description: 'Status' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<ProjectDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
