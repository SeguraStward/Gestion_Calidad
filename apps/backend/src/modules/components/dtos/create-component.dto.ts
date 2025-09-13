import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateComponentDto {
  @ApiProperty({ description: 'Component code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Component name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Component description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: 'Dimension ID' })
  @IsString()
  @IsNotEmpty()
  dimensionId: string;

  @ApiProperty({ enum: Status, description: 'Component status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
