import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { CriterionDto } from '@src/modules/criteria/dtos/criterion.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class StandardDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Standard ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Standard code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Standard name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Standard description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: 'Criterion ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  criterionId: string;

  @ApiProperty({ enum: Status, description: 'Standard status' })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ type: () => CriterionDto, description: 'Associated criterion' })
  @Expose()
  @Type(() => CriterionDto)
  @IsOptional()
  criterion?: CriterionDto;

  @ApiPropertyOptional({ description: 'Associated evidences', type: 'array' })
  @Expose()
  @IsOptional()
  evidences?: any[];

  @ApiPropertyOptional({ description: 'Associated standard evidences', type: 'array' })
  @Expose()
  @IsOptional()
  standardEvidences?: any[];
}
