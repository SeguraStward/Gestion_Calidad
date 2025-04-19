import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class FacultyDto {
  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version number' })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Faculty code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Academic load status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<FacultyDto> = {}) {
    Object.assign(this, dto);
  }
}
