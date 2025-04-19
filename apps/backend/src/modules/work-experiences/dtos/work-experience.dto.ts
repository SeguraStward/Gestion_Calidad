import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

import { EvidenceDto } from '@modules/general-types-dto';

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

  @ApiProperty({ description: 'Evidence files', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  @IsOptional()
  evidence?: EvidenceDto[];

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
