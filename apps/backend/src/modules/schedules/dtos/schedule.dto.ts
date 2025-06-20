import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ScheduleDays } from '@una-gc/database/prisma/generated/client'; // Import for ScheduleDays enum
import { BaseDto } from '@src/modules/generalDto';

export class ScheduleDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Schedule ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Schedule day', enum: ScheduleDays })
  @IsEnum(ScheduleDays)
  day: ScheduleDays;

  @ApiProperty({ description: 'Start time' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsString()
  endTime: string;

  constructor(dto: Partial<ScheduleDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
