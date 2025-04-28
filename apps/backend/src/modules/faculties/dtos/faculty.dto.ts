import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class FacultyDto {
  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Faculty code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Status of the faculty', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  constructor(dto: Partial<FacultyDto> = {}) {
    Object.assign(this, dto);
  }
}
