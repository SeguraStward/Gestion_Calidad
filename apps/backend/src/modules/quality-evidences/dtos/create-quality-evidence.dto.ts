import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateQualityEvidenceDto {
  @ApiProperty({ description: 'Quality Evidence code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Quality Evidence name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Quality Evidence description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiPropertyOptional({ description: 'Standard ID' })
  @IsString()
  @IsOptional()
  standardId?: string;

  @ApiPropertyOptional({ description: 'Criterion ID' })
  @IsString()
  @IsOptional()
  criterionId?: string;

  @ApiProperty({ enum: Status, description: 'Quality Evidence status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
