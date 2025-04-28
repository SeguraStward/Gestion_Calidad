import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class AcademicPeriodDto {
  @ApiPropertyOptional({ description: 'AcademicPeriod ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Code of the academic period' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Description of the academic period' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Status of the academic period' })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ description: 'Name of the academic period' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Start date of the academic period' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the academic period' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  constructor(dto: Partial<AcademicPeriodDto> = {}) {
    Object.assign(this, dto);
  }
}
