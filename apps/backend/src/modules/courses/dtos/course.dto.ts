import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';
import { CareerDto } from '@src/modules/careers/dtos/career.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CourseDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Course ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Name' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Credits' })
  @Expose()
  @IsInt()
  credits: number;

  @ApiProperty({ description: 'Level' })
  @Expose()
  @IsNotEmpty()
  level: number;

  @ApiProperty({ description: 'Contact Hours' })
  @Expose()
  @IsInt()
  contactHours: number;

  @ApiProperty({ description: 'Independent Hours' })
  @Expose()
  @IsInt()
  @IsOptional()
  independentHours: number;

  @ApiPropertyOptional({ description: 'Career ID' })
  @IsString()
  @IsOptional()
  careerId?: string;

  @ApiProperty({ description: 'Course Status', enum: Status, default: Status.ACTIVE })
  @Expose()
  @IsEnum(Status)
  status: Status;

  // relations
  @ApiPropertyOptional({ type: () => CareerDto, description: 'Associated Career' })
  @Expose()
  @Type(() => CareerDto)
  @IsOptional()
  career?: CareerDto;

  @ApiPropertyOptional({ type: () => [AcademicLoadDto], description: 'Associated AcademicLoads' })
  @Expose()
  @Type(() => AcademicLoadDto)
  @IsOptional()
  academicLoads?: AcademicLoadDto[];

  constructor(dto: Partial<CourseDto> | any = {}) {
    super();
    Object.assign(this, dto);
    if (dto.career && !(dto.career instanceof CareerDto)) {
      this.career = new CareerDto(dto.career);
    }
  }
}
