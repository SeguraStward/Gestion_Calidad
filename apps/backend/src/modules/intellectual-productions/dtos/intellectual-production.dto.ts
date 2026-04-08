import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class IntellectualProductionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'IntellectualProduction ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Category' })
  @Expose()
  @IsString()
  category: string;

  @ApiProperty({ description: 'Production name' })
  @Expose()
  @IsString()
  productionName: string;

  @ApiProperty({ description: 'Topic' })
  @Expose()
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  @ApiProperty({ description: 'Year' })
  @Expose()
  @IsString()
  year: number;

  @ApiProperty({ description: 'Presentation place' })
  @Expose()
  @IsString()
  presentationPlace: string;

  @ApiProperty({ description: 'Presentation count' })
  @Expose()
  @IsInt()
  presentationCount: number;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Status', enum: Status })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<IntellectualProductionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
