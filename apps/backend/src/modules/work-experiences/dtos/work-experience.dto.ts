import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkExperienceEvidenceDto {
  @ApiProperty({ description: 'Download path' })
  @IsString()
  download: string;

  @ApiProperty({ description: 'File ID' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Link to evidence' })
  @IsString()
  link: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'File type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'URI path' })
  @IsString()
  uri: string;
}

export class WorkExperienceDto {
  @ApiPropertyOptional({ description: 'WorkExperience ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Evidence files', type: [WorkExperienceEvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceEvidenceDto)
  @IsOptional()
  evidence?: WorkExperienceEvidenceDto[];

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Position held' })
  @IsString()
  position: string;

  @ApiProperty({ description: 'Responsibilities', type: [String] })
  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @ApiProperty({ description: 'Experience type' })
  @IsString()
  experienceType: string;

  @ApiProperty({ description: 'Document reference' })
  @IsString()
  document: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Version' })
  @IsInt()
  @IsOptional()
  version?: number;

  constructor(dto: Partial<WorkExperienceDto> = {}) {
    Object.assign(this, dto);
  }
}
