import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';

export class ClassroomDto extends AuditFields {
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
