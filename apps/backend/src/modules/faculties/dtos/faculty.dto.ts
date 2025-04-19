import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class FacultyDto {
  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version number' })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Faculty code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  constructor(dto: Partial<FacultyDto> = {}) {
    Object.assign(this, dto);
  }
}
