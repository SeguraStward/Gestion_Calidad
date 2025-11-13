import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';

/**
 * DTO for a single course row in bulk import
 */
export class CourseRowDto {
  @ApiProperty({
    description: 'Course code (e.g., EIF400, MAT101)',
    example: 'EIF400',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Fundamentos de Informática',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Course credits',
    example: 4,
  })
  @IsNumber()
  @IsNotEmpty()
  creditos: number;

  @ApiProperty({
    description: 'Course level (1-5)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  nivel: number;

  @ApiProperty({
    description: 'Contact hours per week',
    example: 4,
  })
  @IsNumber()
  @IsNotEmpty()
  horasContacto: number;

  @ApiProperty({
    description: 'Independent hours per week (optional)',
    example: 6,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  horasIndependientes?: number;

  @ApiProperty({
    description: 'Course description (optional)',
    example: 'Curso introductorio a la programación',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

/**
 * DTO for bulk import of courses
 */
export class BulkImportCoursesDto {
  @ApiProperty({
    description: 'Array of course records to import',
    type: [CourseRowDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseRowDto)
  courses: CourseRowDto[];
}

/**
 * DTO for bulk import result
 */
export class BulkImportCoursesResultDto {
  @ApiProperty({ description: 'Number of courses created' })
  created: number;

  @ApiProperty({ description: 'Number of courses updated' })
  updated: number;

  @ApiProperty({ description: 'Number of errors encountered' })
  errors: number;

  @ApiProperty({ description: 'Detailed error messages', type: [String] })
  errorDetails: string[];

  @ApiProperty({ description: 'IDs of successfully imported courses', type: [String] })
  courseIds: string[];
}
