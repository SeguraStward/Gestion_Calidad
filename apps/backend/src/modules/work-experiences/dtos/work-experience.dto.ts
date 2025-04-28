import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

import { EvidenceDto } from '@modules/general-types-dto';

export class WorkExperienceDto {
  @ApiPropertyOptional({ description: 'WorkExperience ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Position in the company' })
  @IsString()
  position: string;

  @ApiProperty({ description: 'List of responsibilities' })
  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @ApiProperty({ description: 'Type of experience' })
  @IsString()
  experienceType: string;

  @ApiProperty({ description: 'Start date of the experience' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date of the experience' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Evidence documents' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  @IsOptional()
  evidence?: EvidenceDto[];

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Status of the work experience' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Document reference' })
  @IsString()
  @IsOptional()
  document?: string;

  constructor(dto: Partial<WorkExperienceDto> = {}) {
    Object.assign(this, dto);
  }
}
