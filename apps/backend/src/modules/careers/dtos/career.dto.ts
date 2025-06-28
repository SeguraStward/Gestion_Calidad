import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditFields } from '@src/dtos/audit-fields.dto';
import { CourseDto } from '@src/modules/courses/dtos/course.dto';
import { ProjectDto } from '@src/modules/projects/dtos/project.dto';
import { SchoolDto } from '@src/modules/schools/dtos/school.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CareerDto extends AuditFields {
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
  // @Expose() // No exponer el id de la escuela, solo la relación
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @ApiPropertyOptional({ type: () => SchoolDto })
  @Expose()
  @Type(() => SchoolDto)
  @IsOptional()
  school?: SchoolDto;

  @ApiPropertyOptional({ type: () => [ProjectDto] })
  @Expose()
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
