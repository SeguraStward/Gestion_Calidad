import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class CampusDto {
  @ApiPropertyOptional({ description: 'Campus ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Version' })
  @IsInt()
  version: number;

  @ApiProperty({ description: 'Code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  constructor(dto: Partial<CampusDto> = {}) {
    Object.assign(this, dto);
  }
}
