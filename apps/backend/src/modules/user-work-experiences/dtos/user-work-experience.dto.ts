import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';

export class UserWorkExperienceDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserWorkExperience ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Company name' })
  @Expose()
  @IsString()
  company: string;

  @ApiProperty({ description: 'Position in the company' })
  @Expose()
  @IsString()
  position: string;

  @ApiProperty({ description: 'List of responsibilities' })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @ApiProperty({ description: 'Type of experience' })
  @Expose()
  @IsString()
  experienceType: string;

  @ApiProperty({ description: 'Start date of the experience' })
  @Type(() => Date)
  @Expose()
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date of the experience' })
  @Type(() => Date)
  @Expose()
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Evidence documents' })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  @IsOptional()
  evidence?: EvidenceDto[];

  @ApiProperty({ description: 'User ID' })
  @Expose()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Status of the work experience' })
  @Expose()
  @IsString()
  status: string;

  constructor(dto: Partial<UserWorkExperienceDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
