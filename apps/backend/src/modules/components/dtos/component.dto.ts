import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { DimensionDto } from '@src/modules/dimensions/dtos/dimension.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class ComponentDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Component ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Component code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Component name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Component description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: 'Dimension ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  dimensionId: string;

  @ApiProperty({ enum: Status, description: 'Component status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => DimensionDto, description: 'Associated dimension' })
  @Expose()
  @Type(() => DimensionDto)
  @IsOptional()
  dimension?: DimensionDto;

  @ApiPropertyOptional({ description: 'Associated criteria', type: 'array' })
  @Expose()
  @IsOptional()
  criteria?: any[];
}
