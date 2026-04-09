import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitReportDto {
  @ApiProperty({ description: 'ID del curso', example: '507f1f77bcf86cd799439011' })
  @IsString({ message: 'El ID del curso no es válido' })
  courseId!: string;

  @ApiProperty({ description: 'Cantidad de matriculados', example: 30 })
  @IsInt({ message: 'Los matriculados deben ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 estudiante matriculado' })
  @Max(500, { message: 'La cantidad de matriculados parece demasiado alta' })
  matriculados!: number;

  @ApiProperty({ description: 'Cantidad de aprobados', example: 20 })
  @IsInt({ message: 'Los aprobados deben ser un número entero' })
  @Min(0, { message: 'Los aprobados no pueden ser negativos' })
  aprobados!: number;

  @ApiProperty({ description: 'Cantidad de reprobados', example: 10 })
  @IsInt({ message: 'Los reprobados deben ser un número entero' })
  @Min(0, { message: 'Los reprobados no pueden ser negativos' })
  reprobados!: number;

  @ApiProperty({ description: 'Es informe final (true) o pre-informe (false)', default: false })
  @IsOptional()
  @IsBoolean({ message: 'El tipo de informe debe ser verdadero o falso' })
  isFinal?: boolean;
}
