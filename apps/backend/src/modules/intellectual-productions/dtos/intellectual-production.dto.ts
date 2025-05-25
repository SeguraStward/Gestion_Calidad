import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';
import { BaseDto } from '@src/modules/generalDto';

export class IntellectualProductionDto extends BaseDto {
  @ApiPropertyOptional({ description: 'IntellectualProduction ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Production name' })
  @IsString()
  productionName: string;

  @ApiProperty({ description: 'Topic' })
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiProperty({ description: 'Year' })
  @IsString()
  year: number;

  @ApiProperty({ description: 'Presentation place' })
  @IsString()
  presentationPlace: string;

  @ApiProperty({ description: 'Presentation count' })
  @IsInt()
  presentationCount: number;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Status', enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<IntellectualProductionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
