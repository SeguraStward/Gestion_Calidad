import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';

export class UserWorkExperienceDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserWorkExperience ID' })
  @IsString()
  @IsOptional()
  id?: string;

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

  constructor(dto: Partial<UserWorkExperienceDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
