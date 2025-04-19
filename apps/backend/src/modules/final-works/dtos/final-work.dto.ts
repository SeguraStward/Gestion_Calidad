import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { EvidenceDto } from '@modules/general-types-dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class FinalWorkDto {
  @ApiPropertyOptional({ description: 'FinalWork ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Final Work Dto status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Type' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Version', default: 0 })
  @IsInt()
  @IsOptional()
  version?: number = 0;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<FinalWorkDto> = {}) {
    Object.assign(this, dto);
  }
}
