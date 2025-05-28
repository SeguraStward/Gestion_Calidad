import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class CourseDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Credits' })
  @IsInt()
  credits: number;

  @ApiProperty({ description: 'Level' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Contact Hours' })
  @IsInt()
  contactHours: number;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  schoolId: string;

  @ApiProperty({ description: 'Career ID' })
  @IsString()
  careerId: string;

  @ApiProperty({ description: 'Course Dto Status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CourseDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
