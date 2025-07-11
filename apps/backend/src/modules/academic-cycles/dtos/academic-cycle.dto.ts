import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';

export class AcademicCycleDto extends AuditFields {
  @ApiPropertyOptional({ description: 'AcademicCycle ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code of the academic cycle' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Name of the academic cycle' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Year of the academic cycle' })
  @Expose()
  @IsInt()
  year: number;

  @ApiPropertyOptional({ description: 'Description of the academic cycle' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Start date of the academic cycle' })
  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the academic cycle' })
  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Final month of the academic cycle' })
  @Expose()
  @IsInt()
  @IsOptional()
  finalMonth?: number;

  @ApiPropertyOptional({ description: 'Intermediate month of the academic cycle' })
  @Expose()
  @IsInt()
  @IsOptional()
  initMonth?: number;

  @ApiProperty({ description: 'Status of the academic cycle' })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicCycleDto> | any = {}) {
    super();
    Object.assign(this, dto);
  }
}
