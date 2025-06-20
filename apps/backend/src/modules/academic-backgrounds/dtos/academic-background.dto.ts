import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsDate } from 'class-validator';

import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';
import { BaseDto } from '@src/modules/generalDto';

export class AcademicBackgroundDto extends BaseDto {
  @ApiPropertyOptional({ description: 'AcademicBackground ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Academic title' })
  @IsString()
  academicTitle: string;

  @ApiProperty({ description: 'Evidence documents', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiPropertyOptional({ description: 'Observations' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ description: 'Date' })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'Institution name' })
  @IsString()
  institution: string;

  @ApiProperty({ description: 'Institution type' })
  @IsString()
  InstitutionType: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicBackgroundDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
