import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { CohortStatus } from '@una-gc/database/prisma/generated/client';

export class CreateCohortDto {
  @ApiProperty({ description: 'ID de la carrera', example: '507f1f77bcf86cd799439011' })
  @IsString()
  careerId!: string;

  @ApiProperty({ description: 'Año del cohorte', example: 2024 })
  @IsInt()
  @IsPositive()
  year!: number;

  @ApiProperty({ description: 'Grupo del cohorte (A, B, etc.)', example: 'A' })
  @IsString()
  group!: string;

  @ApiProperty({ description: 'Cantidad inicial de estudiantes', example: 40 })
  @IsInt()
  @IsPositive()
  initialStudents!: number;

  @ApiProperty({ enum: CohortStatus, default: CohortStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;
}
