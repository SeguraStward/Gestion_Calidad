import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class CareerDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Career ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Career code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Career name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'School ID' })
  @IsString()
  schoolId: string;

  @ApiProperty({ description: 'Status of the career', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CareerDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
