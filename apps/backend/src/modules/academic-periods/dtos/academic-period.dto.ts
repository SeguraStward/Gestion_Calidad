import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class AcademicPeriodDto {
  @ApiPropertyOptional({ description: 'AcademicPeriod ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Name of the academic period' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ description: 'Start date of the academic period' })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ description: 'End date of the academic period' })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  constructor(dto: Partial<AcademicPeriodDto> = {}) {
    Object.assign(this, dto);
  }
}
