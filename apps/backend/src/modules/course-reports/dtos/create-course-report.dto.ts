import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { CourseReportStatus } from '@una-gc/database/prisma/generated/client';

export class CreateCourseReportDto {
  @ApiProperty({ description: 'ID del curso', example: '507f1f77bcf86cd799439011' })
  @IsString()
  courseId!: string;

  @ApiProperty({ description: 'ID del ciclo académico', example: '507f1f77bcf86cd799439011' })
  @IsString()
  academicCycleId!: string;

  @ApiProperty({ description: 'ID del campus', example: '507f1f77bcf86cd799439011' })
  @IsString()
  campusId!: string;

  @ApiProperty({ description: 'ID del profesor (User)', example: '507f1f77bcf86cd799439011' })
  @IsString()
  professorId!: string;

  @ApiProperty({ description: 'Cantidad de matriculados', example: 30 })
  @IsInt()
  @Min(0)
  matriculados!: number;

  @ApiProperty({ description: 'Cantidad de aprobados', example: 20 })
  @IsInt()
  @Min(0)
  aprobados!: number;

  @ApiProperty({ description: 'Cantidad de reprobados', example: 10 })
  @IsInt()
  @Min(0)
  reprobados!: number;

  @ApiProperty({ description: 'Es informe final (true) o pre-informe (false)', default: false })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @ApiProperty({ enum: CourseReportStatus, default: CourseReportStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(CourseReportStatus)
  status?: CourseReportStatus;
}
