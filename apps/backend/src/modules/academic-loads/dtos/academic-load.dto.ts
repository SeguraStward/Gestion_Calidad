import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client'; // Assuming Status is correctly generated
import { Expose, Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AcademicCycleDto } from '@src/modules/academic-cycles/dtos/academic-cycle.dto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';
import { CourseDto } from '@src/modules/courses/dtos/course.dto';
import { UserDto } from '@src/modules/users/dtos/user.dto';
// Import the AcademicLoadGroupDto
import { AcademicLoadGroupDto } from '@src/modules/academic-load-groups/dtos/academic-load-group.dto'; // Adjust path if necessary

export class AcademicLoadDto extends AuditFields {
  @ApiPropertyOptional({ description: 'AcademicLoad ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'NRC code' })
  @Expose()
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

  @ApiPropertyOptional({ description: 'Classroom ID' }) // Made optional as per Prisma schema
  @IsString()
  @IsOptional()
  classroomId?: string;

  @ApiProperty({ description: 'Maximum capacity' })
  @Expose()
  @IsInt()
  @Type(() => Number)
  maximumCapacity: number;

  @ApiProperty({ description: 'Enrolled capacity' })
  @Expose()
  @IsInt()
  @Type(() => Number)
  enrolledCapacity: number;

  @ApiProperty({ description: 'Available seats' })
  @Expose()
  @IsInt()
  @Type(() => Number)
  availableSeats: number;

  @ApiProperty({ description: 'Group ID' })
  @Expose() // Keep Expose if you want to send groupId even if group object is not included
  @IsString()
  groupId: string;

  @ApiPropertyOptional({ description: 'Schedule ID' }) // Made optional as per Prisma schema
  @IsString()
  @IsOptional()
  scheduleId?: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  @ApiPropertyOptional({ description: 'Date' })
  @Expose()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(
    ({ value }) => {
      if (!value || value === null || value === undefined || value === '') {
        return undefined;
      }

      if (value instanceof Date) {
        return isNaN(value.getTime()) ? undefined : value;
      }

      if (typeof value === 'string') {
        // If it's just a date string (YYYY-MM-DD), add time component
        if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const date = new Date(value + 'T00:00:00.000Z');
          return isNaN(date.getTime()) ? undefined : date;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      }

      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    },
    { toClassOnly: true },
  )
  @Transform(
    ({ value }) => {
      // Transform when serializing to plain object (toPlainOnly)
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toISOString();
      }
      return value;
    },
    { toPlainOnly: true },
  )
  date?: Date;

  @ApiProperty({ description: 'Status of the academic load', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ type: () => CourseDto })
  @Expose()
  @Type(() => CourseDto)
  @ValidateNested()
  @IsOptional()
  course?: CourseDto;

  @ApiPropertyOptional({ type: () => AcademicCycleDto })
  @Expose()
  @Type(() => AcademicCycleDto)
  @ValidateNested()
  @IsOptional()
  academicCycle?: AcademicCycleDto;

  @ApiPropertyOptional({ type: () => UserDto })
  @Expose()
  @Type(() => UserDto)
  @ValidateNested()
  @IsOptional()
  professor?: UserDto;

  @ApiPropertyOptional({ type: () => CampusDto })
  @Expose()
  @Type(() => CampusDto)
  @ValidateNested()
  @IsOptional()
  campus?: CampusDto;

  // Add the group property
  @ApiPropertyOptional({ type: () => AcademicLoadGroupDto })
  @Expose()
  @Type(() => AcademicLoadGroupDto)
  @ValidateNested()
  @IsOptional()
  group?: AcademicLoadGroupDto;

  constructor(partial: Partial<AcademicLoadDto> | any = {}) {
    super();
    Object.assign(this, partial);

    // Ensure nested DTOs are instantiated if plain objects are passed
    if (partial.course && !(partial.course instanceof CourseDto)) {
      this.course = new CourseDto(partial.course);
    }
    if (partial.academicCycle && !(partial.academicCycle instanceof AcademicCycleDto)) {
      this.academicCycle = new AcademicCycleDto(partial.academicCycle);
    }
    if (partial.professor && !(partial.professor instanceof UserDto)) {
      this.professor = new UserDto(partial.professor);
    }
    if (partial.campus && !(partial.campus instanceof CampusDto)) {
      this.campus = new CampusDto(partial.campus);
    }
    // Handle group instantiation
    if (partial.group && !(partial.group instanceof AcademicLoadGroupDto)) {
      this.group = new AcademicLoadGroupDto(partial.group);
    }
  }
}
