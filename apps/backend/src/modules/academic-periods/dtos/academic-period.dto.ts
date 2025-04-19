import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsNotEmpty } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  status: string;

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
