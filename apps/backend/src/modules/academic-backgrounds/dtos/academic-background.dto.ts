import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class AcademicBackgroundDto extends AuditFields {
  @ApiPropertyOptional({ description: 'AcademicBackground ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Academic title' })
  @Expose()
  @IsString()
  academicTitle: string;

  @ApiProperty({ description: 'Evidence documents', type: [EvidenceDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiPropertyOptional({ description: 'Observations' })
  @Expose()
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ description: 'Date' })
  @Expose()
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'Institution name' })
  @Expose()
  @IsString()
  institution: string;

  @ApiProperty({ description: 'Institution type' })
  @Expose()
  @IsString()
  InstitutionType: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicBackgroundDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
