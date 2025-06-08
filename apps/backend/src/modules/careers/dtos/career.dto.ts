import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { Expose, Type } from 'class-transformer';
import { CourseDto } from 'src/modules/courses/dtos/course.dto';
import { SchoolDto } from '@src/modules/schools/dtos/school.dto';
import { ProjectDto } from '@src/modules/projects/dtos/project.dto';

export class CareerDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Career ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Career code' })
  @Expose()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Career name' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  schoolId: string;

  @ApiPropertyOptional({ type: () => SchoolDto })
  @Expose()
  @Type(() => SchoolDto)
  @IsOptional()
  school?: SchoolDto;

  @Expose()
  @ApiPropertyOptional({ type: () => [ProjectDto] })
  @Type(() => ProjectDto)
  @IsOptional()
  projects?: ProjectDto[];

  @Expose()
  @ApiPropertyOptional({ type: () => [CourseDto] })
  @Type(() => CourseDto)
  @IsOptional()
  courses?: CourseDto[];

  @ApiProperty({ description: 'Status of the career', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CareerDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
