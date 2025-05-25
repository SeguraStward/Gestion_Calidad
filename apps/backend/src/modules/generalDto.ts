import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseDto {
  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  // Campos de auditoría opcionales (solo para respuestas)
  @ApiPropertyOptional({ description: 'Creation timestamp', readOnly: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update timestamp', readOnly: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', readOnly: true })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Last updated by user ID', readOnly: true })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
