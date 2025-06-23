import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { Expose } from 'class-transformer';

export class AcademicLoadGroupDto extends BaseDto {
  @ApiPropertyOptional({ description: 'AcademicLoadGroup ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Group number' })
  @IsString()
  @Expose()
  number: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicLoadGroupDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
