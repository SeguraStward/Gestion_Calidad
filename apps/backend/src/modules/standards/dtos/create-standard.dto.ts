import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateStandardDto {
  @ApiProperty({ description: 'Standard code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Standard name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Standard description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: 'Criterion ID' })
  @IsString()
  @IsNotEmpty()
  criterionId: string;

  @ApiProperty({ enum: Status, description: 'Standard status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
