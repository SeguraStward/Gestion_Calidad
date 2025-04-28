import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CourseDto {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Credits' })
  @IsInt()
  credits: number;

  @ApiProperty({ description: 'Level' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Contact Hours' })
  @IsInt()
  contactHours: number;

  @ApiProperty({ description: 'Course Dto Status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  schoolId: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(dto: Partial<CourseDto> = {}) {
    Object.assign(this, dto);
  }
}
