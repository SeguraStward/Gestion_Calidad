import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsDate, IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';

export class FinalWorkDto {
  @ApiPropertyOptional({ description: 'FinalWork ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiProperty({ description: 'Type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Final Work Dto status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  constructor(dto: Partial<FinalWorkDto> = {}) {
    Object.assign(this, dto);
  }
}
