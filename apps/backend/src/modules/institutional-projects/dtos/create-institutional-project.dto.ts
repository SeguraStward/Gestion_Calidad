import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ProjectType, AllocationStatus, Status } from '@una-gc/database/prisma/generated/client';

export class CreateInstitutionalProjectDto {
  @ApiProperty({ description: 'Código único del proyecto', example: 'PROJ-2025-001' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Título del proyecto', example: 'Sistema de Gestión Académica' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Objetivos del proyecto', required: false })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiProperty({ enum: ProjectType, description: 'Tipo de proyecto', example: ProjectType.INSTITUTIONAL })
  @IsEnum(ProjectType)
  projectType!: ProjectType;

  @ApiProperty({ description: 'Tiempo de jornada requerido', example: 40 })
  @IsNumber()
  @IsPositive()
  requiredJourneyTime!: number;

  @ApiProperty({ description: 'Tiempo de jornada asignado', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  assignedJourneyTime?: number;

  @ApiProperty({ description: 'Fecha de inicio', example: '2025-01-15' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'Fecha de fin', example: '2025-12-15' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: 'ID de la asignación de campus', example: '507f1f77bcf86cd799439011' })
  @IsString()
  campusAllocationId!: string;

  @ApiProperty({ description: 'ID del director/coordinador', example: '507f1f77bcf86cd799439012' })
  @IsString()
  directorId!: string;

  @ApiProperty({ enum: AllocationStatus, default: AllocationStatus.DRAFT })
  @IsOptional()
  @IsEnum(AllocationStatus)
  projectStatus?: AllocationStatus;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
