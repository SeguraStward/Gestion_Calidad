import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsDate } from 'class-validator';
import { Expose, Type, Transform } from 'class-transformer';

export class BaseDto {
  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiPropertyOptional({
    description: 'Creation timestamp',
    readOnly: true,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => (value instanceof Date ? value : new Date(value)), { toClassOnly: true })
  @Expose()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    readOnly: true,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => (value instanceof Date ? value : new Date(value)), { toClassOnly: true })
  @Expose()
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Created by user ID',
    readOnly: true,
    example: 'user-uuid-here',
  })
  @IsString()
  @IsOptional()
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Last updated by user ID',
    readOnly: true,
    example: 'user-uuid-here',
  })
  @IsString()
  @IsOptional()
  @Expose()
  updatedBy?: string;
}
