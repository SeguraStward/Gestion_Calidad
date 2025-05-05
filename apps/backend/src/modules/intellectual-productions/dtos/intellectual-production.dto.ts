import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';

export class IntellectualProductionDto {
  @ApiPropertyOptional({ description: 'IntellectualProduction ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Topic' })
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Year' })
  @IsString()
  year: string;

  @ApiProperty({ description: 'Presentation count' })
  @IsInt()
  presentationCount: number;

  @ApiProperty({ description: 'Presentation location' })
  @IsString()
  presentationLocation: string;

  @ApiProperty({ description: 'Production name' })
  @IsString()
  productionName: string;

  @ApiPropertyOptional({ description: 'Status', enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<IntellectualProductionDto> = {}) {
    Object.assign(this, dto);
  }
}
