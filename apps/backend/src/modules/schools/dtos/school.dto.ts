import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { FacultyDto } from '@src/modules/faculties/dtos/faculty.dto';
import { CareerDto } from '@src/modules/careers/dtos/career.dto';
//FIXED

export class SchoolDto extends BaseDto {
  @ApiPropertyOptional({ description: 'School ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'School code' })
  @Expose()
  @IsString()
  code: string;

  @ApiProperty({ name: 'School name' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'School description' })
  @Expose()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Faculty ID' })
  // @Expose() // No exponer el id de la facultad, solo la relación
  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @ApiPropertyOptional({ type: () => FacultyDto, description: 'Facultad a la que pertenece la escuela' })
  @Expose()
  @Type(() => FacultyDto)
  @IsOptional()
  faculty?: FacultyDto;

  @ApiPropertyOptional({ type: () => [CareerDto] })
  @Expose()
  @Type(() => CareerDto)
  @IsOptional()
  careers?: CareerDto[];

  @ApiProperty({ description: 'Status', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<SchoolDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}

