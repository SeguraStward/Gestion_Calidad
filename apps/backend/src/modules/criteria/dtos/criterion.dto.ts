import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { ComponentDto } from '@src/modules/components/dtos/component.dto';
import { Status, CriterionType } from '@una-gc/database/prisma/generated/client';

export class CriterionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Criterion ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Criterion code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Criterion name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Criterion description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiPropertyOptional({ description: 'Component ID' })
  @Expose()
  @IsString()
  @IsOptional()
  componentId?: string;

  @ApiProperty({ enum: CriterionType, description: 'Criterion type', default: CriterionType.COMPONENT_BASED })
  @Expose()
  @IsEnum(CriterionType)
  @IsOptional()
  type?: CriterionType;

  @ApiPropertyOptional({ description: 'Custom type when type is CUSTOM' })
  @Expose()
  @IsString()
  @IsOptional()
  customType?: string;

  @ApiProperty({ enum: Status, description: 'Criterion status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => ComponentDto, description: 'Associated component' })
  @Expose()
  @Type(() => ComponentDto)
  @IsOptional()
  component?: ComponentDto;

  @ApiPropertyOptional({ description: 'Associated standards', type: 'array' })
  @Expose()
  @IsOptional()
  standards?: any[];

  @ApiPropertyOptional({ description: 'Associated evidences', type: 'array' })
  @Expose()
  @IsOptional()
  evidences?: any[];
}
