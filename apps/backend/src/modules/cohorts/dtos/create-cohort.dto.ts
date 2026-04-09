import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CohortStatus } from '@una-gc/database/prisma/generated/client';

const MIN_YEAR = 2010;
const MAX_YEAR = new Date().getFullYear() + 5;

export class CreateCohortDto {
  @ApiProperty({ description: 'ID de la carrera', example: '507f1f77bcf86cd799439011' })
  @IsString({ message: 'El ID de carrera debe ser un texto válido' })
  careerId!: string;

  @ApiProperty({ description: 'Año del cohorte (ej: 2022, 2023)', example: 2024 })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(MIN_YEAR, { message: `El año no puede ser anterior a ${MIN_YEAR}` })
  @Max(MAX_YEAR, { message: `El año no puede ser mayor a ${MAX_YEAR}` })
  year!: number;

  @ApiProperty({ description: 'Grupo del cohorte (A, B, etc.)', example: 'A' })
  @IsString({ message: 'El grupo debe ser un texto válido (ej: A, B)' })
  group!: string;

  @ApiProperty({ description: 'Cantidad inicial de estudiantes', example: 40 })
  @IsInt({ message: 'La cantidad de estudiantes debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 estudiante en el cohorte' })
  @Max(500, { message: 'La cantidad de estudiantes parece demasiado alta (máximo 500)' })
  initialStudents!: number;

  @ApiProperty({ enum: CohortStatus, default: CohortStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(CohortStatus, { message: 'Estado no válido' })
  status?: CohortStatus;
}
