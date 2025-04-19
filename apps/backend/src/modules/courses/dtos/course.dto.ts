import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CourseDto {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsString()
  @IsOptional()
  id?: string;

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

  @ApiProperty({ description: 'Status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Contact Hours' })
  @IsInt()
  contactHours: number;

  @ApiProperty({ description: 'Level' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  schoolId: string;

  constructor(dto: Partial<CourseDto> = {}) {
    Object.assign(this, dto);
  }
}
