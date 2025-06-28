import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status, WorkType } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class FinalWorkDto extends AuditFields {
  @ApiPropertyOptional({ description: 'FinalWork ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiProperty({ description: 'Type of work', enum: WorkType })
  @IsEnum(WorkType)
  type: WorkType;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'Final Work Dto status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<FinalWorkDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
