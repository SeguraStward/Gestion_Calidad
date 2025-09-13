import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateDimensionDto {
  @ApiProperty({ description: 'Dimension code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Dimension name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Dimension description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ enum: Status, description: 'Dimension status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
