import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, IsDate } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class AcademicLoadDto extends BaseDto {
  @ApiPropertyOptional({ description: 'AcademicLoadGroup ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'NRC code' })
  @IsString()
  nrc: string;

  @ApiProperty({ description: 'Academic Cycle ID' })
  @IsString()
  academicCycleId: string;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Classroom ID' })
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'Maximum capacity' })
  @IsInt()
  maximumCapacity: number;

  @ApiProperty({ description: 'Enrolled capacity' })
  @IsInt()
  enrolledCapacity: number;

  @ApiProperty({ description: 'Available seats' })
  @IsInt()
  availableSeats: number;

  @ApiProperty({ description: 'Group ID' })
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'Schedule ID' })
  @IsString()
  scheduleId: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  @ApiPropertyOptional({ description: 'Date' })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'Status of the academic cycle' })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicLoadDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
