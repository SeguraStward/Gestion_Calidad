import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status, CriterionType } from '@una-gc/database/prisma/generated/client';

export class CreateCriterionDto {
  @ApiProperty({ description: 'Criterion code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Criterion name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Criterion description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiPropertyOptional({ description: 'Component ID' })
  @IsString()
  @IsOptional()
  componentId?: string;

  @ApiProperty({ enum: CriterionType, description: 'Criterion type', default: CriterionType.COMPONENT_BASED })
  @IsEnum(CriterionType)
  @IsOptional()
  type?: CriterionType;

  @ApiPropertyOptional({ description: 'Custom type when type is CUSTOM' })
  @IsString()
  @IsOptional()
  customType?: string;

  @ApiProperty({ enum: Status, description: 'Criterion status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
