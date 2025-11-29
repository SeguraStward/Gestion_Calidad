import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { RepitenciaStatus } from '@una-gc/database/prisma/generated/client';

export class CreateRepitenciaDto {
  @ApiProperty({ description: 'ID del campus', example: '507f1f77bcf86cd799439011' })
  @IsString()
  campusId!: string;

  @ApiProperty({ description: 'ID de la malla curricular', example: '507f1f77bcf86cd799439011' })
  @IsString()
  curricularMeshId!: string;

  @ApiProperty({ description: 'ID del curso', example: '507f1f77bcf86cd799439011' })
  @IsString()
  courseId!: string;

  @ApiProperty({ description: 'ID del ciclo académico', example: '507f1f77bcf86cd799439011' })
  @IsString()
  academicCycleId!: string;

  @ApiProperty({ description: 'ID de la asignación de campus', example: '507f1f77bcf86cd799439011' })
  @IsString()
  campusAllocationId!: string;

  @ApiProperty({ description: 'Nombre del curso', example: 'Programación I' })
  @IsString()
  courseName!: string;

  @ApiProperty({ description: 'Código del curso', example: 'IS-401' })
  @IsString()
  courseCode!: string;

  @ApiProperty({ description: 'Nombre de la carrera', example: 'Ingeniería en Sistemas' })
  @IsString()
  careerName!: string;

  @ApiProperty({ description: 'Horas adicionales requeridas', example: 3 })
  @IsNumber()
  @IsPositive()
  additionalHours!: number;

  @ApiProperty({ description: 'Cantidad de estudiantes repitiendo', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  studentsCount?: number;

  @ApiProperty({ description: 'Razón de la repitencia', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Semestre en que se dicta', required: false })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiProperty({ enum: RepitenciaStatus, default: RepitenciaStatus.PENDING })
  @IsOptional()
  @IsEnum(RepitenciaStatus)
  status?: RepitenciaStatus;
}
