import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateProofDocumentTypeDto {
  @ApiProperty({ description: 'Proof Document Type code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Proof Document Type name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Proof Document Type description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Prefix for generating document codes' })
  @IsString()
  @IsNotEmpty()
  prefix: string;

  @ApiProperty({ enum: Status, description: 'Proof Document Type status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
