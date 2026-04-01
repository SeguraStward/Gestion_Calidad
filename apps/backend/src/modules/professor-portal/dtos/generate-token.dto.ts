import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class GenerateTokenDto {
  @ApiProperty({ description: 'Cédula del profesor', example: '112340567' })
  @IsString()
  cedula!: string;

  @ApiProperty({ description: 'ID del campus', example: '507f1f77bcf86cd799439011' })
  @IsString()
  campusId!: string;

  @ApiProperty({ description: 'ID del ciclo académico', example: '507f1f77bcf86cd799439011' })
  @IsString()
  academicCycleId!: string;

  @ApiProperty({ description: 'Fecha de expiración del token', example: '2026-06-30T23:59:59Z' })
  @IsDateString()
  expiresAt!: string;
}
