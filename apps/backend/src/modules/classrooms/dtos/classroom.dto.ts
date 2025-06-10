import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { IsEnum } from 'class-validator';

import { BaseDto } from '@src/modules/generalDto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';
import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';

export class ClassroomDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Classroom ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Room Number' })
  @IsString()
  @Expose()
  roomNumber: string;

  @ApiProperty({ description: 'Classroom Capacity' })
  @IsInt()
  @Type(() => Number)
  @Expose()
  capacity: number;

  @ApiProperty({ description: 'Classroom Description' })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  @ApiPropertyOptional({ type: () => CampusDto })
  @Expose()
  @Type(() => CampusDto)
  @IsOptional()
  @ValidateNested()
  campus?: CampusDto;

  @Expose()
  @ApiPropertyOptional({ type: () => [AcademicLoadDto] })
  @Type(() => AcademicLoadDto)
  @IsOptional()
  academicLoads?: AcademicLoadDto[];

  @Expose()
  @ApiProperty({ description: 'Status of the classroom', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<ClassroomDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
