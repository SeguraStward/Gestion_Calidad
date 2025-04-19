import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { AcademicLoadStatus } from '@una-gc/database/prisma/generated/client';

export class AcademicLoadDto {
  @ApiPropertyOptional({ description: 'AcademicLoad ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version number', default: 0 })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Available seats' })
  @IsInt()
  availableSeats: number;

  @ApiProperty({ description: 'Enrollment cap' })
  @IsInt()
  enrollmentCap: number;

  @ApiProperty({ description: 'Maximum capacity' })
  @IsInt()
  maximumCap: number;

  @ApiProperty({ description: 'Course number' })
  @IsString()
  courseNumber: string;

  @ApiProperty({ description: 'Academic load status', enum: AcademicLoadStatus })
  @IsEnum(AcademicLoadStatus)
  status: AcademicLoadStatus;

  @ApiProperty({ description: 'Classroom ID' })
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  @ApiProperty({ description: 'AcademicPeriod  ID' })
  @IsString()
  academicPeriodId: string;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Group ID' })
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'Schedule ID' })
  @IsString()
  scheduleId: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  constructor(dto: Partial<AcademicLoadDto> = {}) {
    Object.assign(this, dto);
  }
}
