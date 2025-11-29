import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfessorRowDto {
  @ApiProperty({ description: 'Cédula del profesor' })
  @IsString()
  cedula: string;

  @ApiProperty({ description: 'Nombre completo del profesor' })
  @IsString()
  nombre: string;
}

export class BulkImportProfessorsDto {
  @ApiProperty({
    description: 'Array de profesores a importar',
    type: [ProfessorRowDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessorRowDto)
  professors: ProfessorRowDto[];
}

export class BulkImportResultDto {
  @ApiProperty({ description: 'Número de registros creados' })
  created: number;

  @ApiProperty({ description: 'Número de registros actualizados' })
  updated: number;

  @ApiProperty({ description: 'Número de registros con error' })
  errors: number;

  @ApiProperty({ description: 'Detalles de errores', type: [String] })
  errorDetails: string[];

  @ApiProperty({ description: 'IDs de usuarios creados/actualizados' })
  userIds: string[];
}
