import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, IsDate, IsNotEmpty } from 'class-validator';

import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class AcademicCycleDto extends BaseDto {
  @ApiPropertyOptional({ description: 'AcademicCycle ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Name of the academic cycle' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Year of the academic cycle' })
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiProperty({ description: 'Description of the academic cycle' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Start date of the academic cycle' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the academic cycle' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Status of the academic cycle' })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicCycleDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
