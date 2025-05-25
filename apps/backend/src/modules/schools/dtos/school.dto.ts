import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class SchoolDto extends BaseDto {
  @ApiPropertyOptional({ description: 'School ID' })
  @IsString()
  @IsOptional()
  id?: string;

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

  constructor(dto: Partial<SchoolDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
