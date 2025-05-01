import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray } from 'class-validator';
import { ScheduleDays } from '@una-gc/database/prisma/generated/client'; // Import for ScheduleDays enum

export class ScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Schedule days', type: [String], enum: ScheduleDays, isArray: true })
  @IsEnum(ScheduleDays, { each: true })
  @IsArray()
  days: ScheduleDays[];

  @ApiProperty({ description: 'Start time' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Academic Load IDs', type: [String] })
  @IsArray()
  @IsOptional()
  academicLoadIds?: string[];

  constructor(dto: Partial<ScheduleDto> = {}) {
    Object.assign(this, dto);
  }
}
