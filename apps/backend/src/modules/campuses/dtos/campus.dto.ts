import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { RegionalCenterDto } from '@src/modules/regional-centers/dtos/regional-center.dto';
import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';
import { ClassroomDto } from '@src/modules/classrooms/dtos/classroom.dto';

export class CampusDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Campus ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Name' })
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Regional Center ID' })
  @IsString()
  @IsNotEmpty()
  regionalCenterId: string;

  @ApiPropertyOptional({ type: () => RegionalCenterDto })
  @Expose()
  @Type(() => RegionalCenterDto)
  @ValidateNested()
  @IsOptional()
  regionalCenter?: RegionalCenterDto;

  @Expose()
  @ApiPropertyOptional({ type: () => [ClassroomDto] })
  @Type(() => ClassroomDto)
  @IsOptional()
  classrooms?: ClassroomDto[];

  @Expose()
  @ApiPropertyOptional({ type: () => [AcademicLoadDto] })
  @Type(() => AcademicLoadDto)
  @IsOptional()
  academicLoads?: AcademicLoadDto[];

  @ApiProperty({ description: 'Status of the campus', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CampusDto> | any = {}) {
    super();
    Object.assign(this, dto);
  }
}
