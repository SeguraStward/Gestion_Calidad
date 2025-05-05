import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class SchoolDto {
  @ApiPropertyOptional({ description: 'School ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'School code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'School description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Faculty ID' })
  @IsString()
  facultyId: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ description: 'Course IDs', type: [String] })
  @IsArray()
  @IsOptional()
  courseIds?: string[];

  @ApiPropertyOptional({ description: 'Professor IDs', type: [String] })
  @IsArray()
  @IsOptional()
  professorIds?: string[];

  constructor(dto: Partial<SchoolDto> = {}) {
    Object.assign(this, dto);
  }
}
