import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsDate } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class AcademicLoadDto {
  @ApiPropertyOptional({ description: 'AcademicLoad ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'NRC (Unique identifier for the class section)' })
  @IsString()
  nrc: string;

  @ApiProperty({ description: 'Academic period ID' })
  @IsString()
  academicPeriodId: string;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Classroom ID' })
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'Maximum capacity of the course' })
  @IsInt()
  maximumCapacity: number;

  @ApiProperty({ description: 'Number of enrolled students' })
  @IsInt()
  enrolledCapacity: number;

  @ApiProperty({ description: 'Available seats in the course' })
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

  @ApiPropertyOptional({ description: 'Date associated with the academic load' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiProperty({ description: 'Status of the academic load', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicLoadDto> = {}) {
    Object.assign(this, dto);
  }
}
