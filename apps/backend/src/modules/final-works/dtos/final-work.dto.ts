import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDate, IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { Status, WorkType } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';
import { BaseDto } from '@src/modules/generalDto';

export class FinalWorkDto extends BaseDto {
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
