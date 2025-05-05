import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, IsInt } from 'class-validator'; // delete if not needed someones

export class AcademicLoadsGroupDto {
  @ApiPropertyOptional({ description: 'AcademicLoadsGroup ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Group number' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  constructor(dto: Partial<AcademicLoadsGroupDto> = {}) {
    Object.assign(this, dto);
  }
}
