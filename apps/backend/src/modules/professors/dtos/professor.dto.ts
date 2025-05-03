import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class ProfessorDto {
  @ApiPropertyOptional({ description: 'Professor ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Academic Rank' })
  @IsString()
  academicRank: string;

  @ApiPropertyOptional({ description: 'Biography' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  @IsOptional()
  schoolId: string;

  @ApiPropertyOptional({ description: 'Academic Load IDs', type: [String] })
  @IsArray()
  @IsOptional()
  academicLoadIds?: string[];

  @ApiPropertyOptional({ description: 'Final Report IDs', type: [String] })
  @IsArray()
  @IsOptional()
  finalReportIds?: string[];

  constructor(dto: Partial<ProfessorDto> = {}) {
    Object.assign(this, dto);
  }
}
