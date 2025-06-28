import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class IntellectualProductionDto extends AuditFields {
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
