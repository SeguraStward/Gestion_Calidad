import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AcademicLoadRowDto {
  @ApiProperty({ description: 'Número de aula' })
  @IsString()
  @IsOptional()
  numeroAula?: string;

  @ApiProperty({ description: 'Nombre del campus' })
  @IsString()
  campus: string;

  @ApiProperty({ description: 'Nombre del ciclo académico' })
  @IsString()
  ciclo: string;

  @ApiProperty({ description: 'Cupo disponible' })
  @IsInt()
  @Type(() => Number)
  cupoDisponible: number;

  @ApiProperty({ description: 'Cupo matrícula' })
  @IsInt()
  @Type(() => Number)
  cupoMatricula: number;

  @ApiProperty({ description: 'Cupo máximo' })
  @IsInt()
  @Type(() => Number)
  cupoMaximo: number;

  @ApiProperty({ description: 'Código del curso (ej: DEX321)' })
  @IsString()
  curso: string;

  @ApiProperty({ description: 'Grupo (A, B, C, etc)' })
  @IsString()
  grupo: string;

  @ApiProperty({ description: 'Horario (ej: L-M-V 08:00-10:00)' })
  @IsString()
  @IsOptional()
  horario?: string;

  @ApiProperty({ description: 'NRC' })
  @IsString()
  nrc: string;

  @ApiProperty({ description: 'Cédula del profesor' })
  @IsString()
  profesorCedula: string;
}

export class BulkImportAcademicLoadsDto {
  @ApiProperty({
    description: 'Array de cargas académicas a importar',
    type: [AcademicLoadRowDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcademicLoadRowDto)
  loads: AcademicLoadRowDto[];
}

export class BulkImportAcademicLoadsResultDto {
  @ApiProperty({ description: 'Número de registros creados' })
  created: number;

  @ApiProperty({ description: 'Número de registros actualizados' })
  updated: number;

  @ApiProperty({ description: 'Número de registros con error' })
  errors: number;

  @ApiProperty({ description: 'Detalles de errores', type: [String] })
  errorDetails: string[];

  @ApiProperty({ description: 'IDs de cargas académicas creadas/actualizadas' })
  loadIds: string[];

  @ApiProperty({ description: 'Estadísticas de entidades creadas' })
  stats: {
    professorsCreated: number;
    coursesFound: number;
    schedulesCreated: number;
    groupsFound: number;
  };
}
