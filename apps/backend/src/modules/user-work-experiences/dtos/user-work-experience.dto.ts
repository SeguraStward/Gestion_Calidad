import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

import { EvidenceDto } from '@modules/general-types-dto';
import { BaseDto } from '@src/modules/generalDto';

export class UserWorkExperienceDto extends BaseDto {
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
