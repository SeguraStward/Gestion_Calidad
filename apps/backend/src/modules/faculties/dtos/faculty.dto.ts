import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { SchoolDto } from '@src/modules/schools/dtos/school.dto';

export class FacultyDto extends BaseDto {
  @Expose()
  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @Expose()
  @ApiProperty({ description: 'Faculty code' })
  @IsString()
  code: string;

  @Expose()
  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @ApiProperty({ description: 'Status of the faculty', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @Expose()
  @ApiPropertyOptional({ type: () => [SchoolDto] })
  @Type(() => SchoolDto)
  @IsOptional()
  schools?: SchoolDto[];

  constructor(dto: Partial<FacultyDto> = {}) {
    super();
    Object.assign(this, dto);
    if (dto && Array.isArray((dto as any).schools)) {
      this.schools = (dto as any).schools;
    }
  }
}
